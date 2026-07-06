const pool = require("../config/db");

// Add Comment
const addComment = async (req, res) => {
  try {
    const { project_id, message } = req.body;

    const userId = req.user.id;

    if (!project_id || !message) {
      return res.status(400).json({
        message: "Project and message are required.",
      });
    }

    const projectRes = await pool.query(
      "SELECT * FROM projects WHERE id=$1",
      [project_id]
    );

    if (projectRes.rows.length === 0) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    const project = projectRes.rows[0];
    const userRole = req.user.role;

    if (userRole !== "admin" && project.client_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to access this project.",
      });
    }

    const result = await pool.query(
      `INSERT INTO comments
      (project_id,user_id,message)
      VALUES($1,$2,$3)
      RETURNING *`,
      [project_id, userId, message]
    );

    // Log activity
    const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    const userName = userRes.rows[0]?.name || "Unknown";
    await pool.query(
      `INSERT INTO activities (project_id, user_id, type, message)
       VALUES ($1, $2, $3, $4)`,
      [project_id, userId, "comment_added", `${userName} posted a comment`]
    );

    // Update project updated_at
    await pool.query("UPDATE projects SET updated_at = NOW() WHERE id = $1", [project_id]);

    res.status(201).json({
      message: "Comment added successfully.",
      comment: result.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }
};

// Get Comments
const getComments = async (req, res) => {
  try {

    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check project authorization first
    const projectRes = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const project = projectRes.rows[0];
    if (userRole !== "admin" && project.client_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to view comments for this project.",
      });
    }

    const result = await pool.query(
      `SELECT comments.*, users.name, users.role AS user_role
       FROM comments
       JOIN users
       ON comments.user_id = users.id
       WHERE project_id=$1
       ORDER BY created_at ASC`,
      [projectId]
    );

    res.status(200).json({
      comments: result.rows,
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });

  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the comment first
    const commentRes = await pool.query("SELECT * FROM comments WHERE id = $1", [id]);
    if (commentRes.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = commentRes.rows[0];

    // Admin can delete any comment; Client can only delete their own
    if (userRole !== "admin" && comment.user_id !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this comment",
      });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
};