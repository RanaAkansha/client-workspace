const pool = require("../config/db");

// Upload Deliverable
const uploadDeliverable = async (req, res) => {
  try {
    const { project_id, title, description, file_url } = req.body;

    const uploadedBy = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only agency admins can upload deliverables.",
      });
    }

    if (!project_id || !title || !file_url) {
      return res.status(400).json({
        message: "Project, title and file URL are required.",
      });
    }

    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [project_id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    // Auto-calculate next version number for this deliverable title within the project
    const versionRes = await pool.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS next_version
       FROM deliverables
       WHERE project_id = $1 AND title = $2`,
      [project_id, title]
    );
    const nextVersion = versionRes.rows[0].next_version;

    const result = await pool.query(
      `INSERT INTO deliverables
      (project_id, title, description, file_url, uploaded_by, version, status)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [project_id, title, description, file_url, uploadedBy, nextVersion, "draft"]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activities (project_id, user_id, type, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        project_id,
        uploadedBy,
        "deliverable_uploaded",
        `${title} v${nextVersion} uploaded`,
        JSON.stringify({ deliverable_title: title, version: nextVersion }),
      ]
    );

    // Update project updated_at
    await pool.query("UPDATE projects SET updated_at = NOW() WHERE id = $1", [project_id]);

    res.status(201).json({
      message: "Deliverable uploaded successfully.",
      deliverable: result.rows[0],
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getDeliverables = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let result;

    if (role === "admin") {
      result = await pool.query(
        `SELECT
          d.*,
          p.title AS project_title,
          u.name AS uploaded_by_name
        FROM deliverables d
        JOIN projects p ON d.project_id = p.id
        JOIN users u ON d.uploaded_by = u.id
        ORDER BY d.uploaded_at DESC`
      );
    } else {
      result = await pool.query(
        `SELECT
          d.*,
          p.title AS project_title,
          u.name AS uploaded_by_name
        FROM deliverables d
        JOIN projects p ON d.project_id = p.id
        JOIN users u ON d.uploaded_by = u.id
        WHERE p.client_id = $1
        ORDER BY d.uploaded_at DESC`,
        [userId]
      );
    }

    res.json({ deliverables: result.rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getProjectDeliverables = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify access
    const projectRes = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const project = projectRes.rows[0];
    if (userRole !== "admin" && project.client_id !== userId) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const result = await pool.query(
      `SELECT d.*, u.name AS uploaded_by_name
       FROM deliverables d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.project_id = $1
       ORDER BY d.uploaded_at DESC`,
      [projectId]
    );

    res.json({ deliverables: result.rows });
  } catch (error) {
    console.error("Get project deliverables error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const updateDeliverableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const validStatuses = ["draft", "ready_for_review", "client_reviewing", "changes_requested", "approved", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Get current deliverable
    const deliverableRes = await pool.query(
      `SELECT d.*, p.client_id FROM deliverables d JOIN projects p ON d.project_id = p.id WHERE d.id = $1`,
      [id]
    );
    if (deliverableRes.rows.length === 0) {
      return res.status(404).json({ message: "Deliverable not found" });
    }

    const deliverable = deliverableRes.rows[0];

    // Authorization: admin can do most transitions, client can approve/request changes
    if (userRole === "client") {
      if (deliverable.client_id !== userId) {
        return res.status(403).json({ message: "Not authorized." });
      }
      const clientAllowed = ["approved", "changes_requested"];
      if (!clientAllowed.includes(status)) {
        return res.status(403).json({ message: "Clients can only approve or request changes." });
      }
    }

    const oldStatus = deliverable.status;

    await pool.query(
      "UPDATE deliverables SET status = $1 WHERE id = $2",
      [status, id]
    );

    // Log activity
    const statusLabels = {
      draft: "Draft",
      ready_for_review: "Ready for Review",
      client_reviewing: "Client Reviewing",
      changes_requested: "Changes Requested",
      approved: "Approved",
      completed: "Completed",
    };

    const activityType = status === "approved" ? "approved" : "status_changed";
    const message = status === "approved"
      ? `${deliverable.title} v${deliverable.version} approved`
      : `${deliverable.title} moved to ${statusLabels[status]}`;

    await pool.query(
      `INSERT INTO activities (project_id, user_id, type, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        deliverable.project_id,
        userId,
        activityType,
        message,
        JSON.stringify({ old_status: oldStatus, new_status: status, deliverable_title: deliverable.title }),
      ]
    );

    // Update project updated_at
    await pool.query("UPDATE projects SET updated_at = NOW() WHERE id = $1", [deliverable.project_id]);

    res.json({ message: "Status updated successfully", status });
  } catch (error) {
    console.error("Update deliverable status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteDeliverable = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete deliverables",
      });
    }

    const result = await pool.query("DELETE FROM deliverables WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Deliverable not found" });
    }

    res.status(200).json({
      message: "Deliverable deleted successfully",
    });
  } catch (error) {
    console.error("Delete deliverable error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadDeliverable,
  getDeliverables,
  getProjectDeliverables,
  updateDeliverableStatus,
  deleteDeliverable,
};
