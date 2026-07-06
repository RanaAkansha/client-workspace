const pool = require("../config/db");

const createProject = async (req, res) => {
  try {
    const { title, description, status, client_id, deadline } = req.body;

    const adminId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can create projects",
      });
    }

    if (!title || !client_id) {
      return res.status(400).json({
        message: "Title and client_id are required",
      });
    }

    const clientResult = await pool.query(
      `SELECT id,role FROM users WHERE id = $1`,
      [client_id]
    );

    if (clientResult.rows.length === 0) {
      return res.status(400).json({ message: "Client did not exist." });
    }

    if (clientResult.rows[0].role !== "client") {
      return res.status(400).json({ message: "Assigned user is not a client." });
    }

    const newProject = await pool.query(
      `INSERT INTO projects(title, description, status, client_id, created_by, deadline)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *`,
      [title, description || null, status || "Planning", client_id, adminId, deadline || null]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activities (project_id, user_id, type, message) VALUES ($1, $2, $3, $4)`,
      [newProject.rows[0].id, adminId, "project_created", "Project created"]
    );

    res.status(201).json({
      message: "Project created successfully!",
      project: newProject.rows[0],
    });
  } catch (error) {
    console.error("Create project error", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let projects;

    if (userRole === "admin") {
      projects = await pool.query(
        `SELECT p.*, u.name AS client_name, u.email AS client_email,
                (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = p.id) AS deliverable_count,
                (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = p.id AND d.status IN ('client_reviewing', 'ready_for_review')) AS pending_review_count,
                (SELECT d.status FROM deliverables d WHERE d.project_id = p.id ORDER BY d.uploaded_at DESC LIMIT 1) AS latest_deliverable_status
         FROM projects p
         JOIN users u ON p.client_id = u.id
         ORDER BY p.updated_at DESC`
      );
    } else {
      projects = await pool.query(
        `SELECT p.*, u.name AS client_name,
                (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = p.id) AS deliverable_count,
                (SELECT COUNT(*) FROM deliverables d WHERE d.project_id = p.id AND d.status IN ('client_reviewing', 'ready_for_review')) AS pending_review_count,
                (SELECT d.status FROM deliverables d WHERE d.project_id = p.id ORDER BY d.uploaded_at DESC LIMIT 1) AS latest_deliverable_status
         FROM projects p
         JOIN users u ON p.client_id = u.id
         WHERE p.client_id = $1
         ORDER BY p.updated_at DESC`,
        [userId]
      );
    }

    res.status(200).json({
      message: "Project fetched successfully!",
      projects: projects.rows,
    });
  } catch (error) {
    console.error("Get project error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get project with client info
    const projectRes = await pool.query(
      `SELECT p.*, u.name AS client_name, u.email AS client_email,
              creator.name AS created_by_name
       FROM projects p
       JOIN users u ON p.client_id = u.id
       LEFT JOIN users creator ON p.created_by = creator.id
       WHERE p.id = $1`,
      [id]
    );

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = projectRes.rows[0];

    // Authorization check
    if (userRole !== "admin" && project.client_id !== userId) {
      return res.status(403).json({ message: "Not authorized to view this project." });
    }

    // Get deliverables
    const deliverablesRes = await pool.query(
      `SELECT d.*, u.name AS uploaded_by_name
       FROM deliverables d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.project_id = $1
       ORDER BY d.uploaded_at DESC`,
      [id]
    );

    // Get comments
    const commentsRes = await pool.query(
      `SELECT c.*, u.name, u.role AS user_role
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.project_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Get activities
    const activitiesRes = await pool.query(
      `SELECT a.*, u.name AS user_name, u.role AS user_role
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.project_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    // Compute stats
    const deliverables = deliverablesRes.rows;
    const stats = {
      total_deliverables: deliverables.length,
      pending_review: deliverables.filter(d => d.status === "client_reviewing" || d.status === "ready_for_review").length,
      approved: deliverables.filter(d => d.status === "approved" || d.status === "completed").length,
      changes_requested: deliverables.filter(d => d.status === "changes_requested").length,
    };

    res.json({
      project,
      deliverables,
      comments: commentsRes.rows,
      activities: activitiesRes.rows,
      stats,
    });
  } catch (error) {
    console.error("Get project by ID error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete projects",
      });
    }

    // Safely delete associated data first
    await pool.query("DELETE FROM activities WHERE project_id = $1", [id]);
    await pool.query("DELETE FROM comments WHERE project_id = $1", [id]);
    await pool.query("DELETE FROM deliverables WHERE project_id = $1", [id]);
    const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
};
