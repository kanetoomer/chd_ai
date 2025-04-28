const express = require("express");
const router = express.Router();
const datasetController = require("../controllers/datasetController");
const { authMiddleware } = require("../middleware/auth");
const {
  validateDatasetUpload,
  validateCleaningRequest,
} = require("../middleware/validateRequest");

// Configure multer for file uploads
const { upload } = require("../config/multerConfig");

// All routes are protected by auth
router.use(authMiddleware);

// Upload datasets (up to 5 files)
router.post(
  "/upload",
  upload.array("files", 5),
  validateDatasetUpload,
  datasetController.uploadDatasets
);

// Get all datasets for current user
router.get("/", datasetController.getAllDatasets);

// Get single dataset by ID (must be owned by user)
router.get("/:id", datasetController.getDatasetById);

// Delete dataset (only if owned)
router.delete("/:id", datasetController.deleteDataset);

// Clean dataset (only if owned)
router.post(
  "/:id/clean",
  validateCleaningRequest,
  datasetController.cleanDataset
);

// Get summary statistics
router.get("/:id/statistics", datasetController.getDatasetStatistics);

// Download as CSV
router.get("/:id/download", datasetController.downloadDataset);

module.exports = router;
