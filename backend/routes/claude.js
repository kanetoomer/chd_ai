const express = require("express");
const router = express.Router();
const claudeController = require("../controllers/claudeController");
const { authMiddleware } = require("../middleware/auth");

// Claude AI routes
router.post("/analyze", authMiddleware, claudeController.analyzeDataset);
router.post("/insights", authMiddleware, claudeController.generateInsights);
router.post(
  "/explain-visualization",
  authMiddleware,
  claudeController.explainVisualization
);

module.exports = router;
