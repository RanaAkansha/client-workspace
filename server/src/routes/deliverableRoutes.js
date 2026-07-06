const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  uploadDeliverable,
  getDeliverables,
  getProjectDeliverables,
  updateDeliverableStatus,
  deleteDeliverable,
} = require("../controllers/deliverableController");

router.post("/", protect, uploadDeliverable);
router.get("/", protect, getDeliverables);
router.get("/project/:projectId", protect, getProjectDeliverables);
router.patch("/:id/status", protect, updateDeliverableStatus);
router.delete("/:id", protect, deleteDeliverable);

module.exports = router;