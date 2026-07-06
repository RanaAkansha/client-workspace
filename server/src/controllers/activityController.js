const pool = require("../config/db");

const getProjectActivities = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify project exists and user has access
    const projectRes = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = projectRes.rows[0];
    if (userRole !== "admin" && project.client_id !== userId) {
      return res.status(403).json({ message: "Not authorized to view this project's activity." });
    }

    const result = await pool.query(
      `SELECT a.*, u.name AS user_name, u.role AS user_role
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.project_id = $1
       ORDER BY a.created_at ASC`,
      [projectId]
    );

    res.json({ activities: result.rows });
  } catch (error) {
    console.error("Get activities error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProjectActivities };
