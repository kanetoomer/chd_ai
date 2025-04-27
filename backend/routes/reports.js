const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { validateReportRequest } = require("../middleware/validateRequest");

// Report routes
router.post("/", validateReportRequest, reportController.createReport);
router.get("/", reportController.getAllReports);
router.get("/:id", reportController.getReportById);
router.delete("/:id", reportController.deleteReport);
router.get("/:id/export/:format", reportController.exportReport);

module.exports = router;
