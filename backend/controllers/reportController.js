const ReportModel = require("../models/Report");
const DatasetModel = require("../models/Dataset");
const mongoose = require("mongoose");

/**
 * Create a new report
 * @route POST /api/reports
 */
const createReport = async (req, res) => {
  try {
    const { datasetId, visualizations, insights, name } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(datasetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset ID",
      });
    }

    // Verify dataset exists
    const dataset = await DatasetModel.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    // Create new report
    const report = new ReportModel({
      name: name || `Report-${Date.now()}`,
      dataset: datasetId,
      visualizations,
      insights,
      createdAt: new Date(),
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      reportId: report._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating report",
      error: error.message,
    });
  }
};

/**
 * Get all reports
 * @route GET /api/reports
 */
const getAllReports = async (req, res) => {
  try {
    const reports = await ReportModel.find({}).populate("dataset", "name");

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};

/**
 * Get report by ID
 * @route GET /api/reports/:id
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await ReportModel.findById(id).populate("dataset");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching report",
      error: error.message,
    });
  }
};

/**
 * Delete report
 * @route DELETE /api/reports/:id
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await ReportModel.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting report",
      error: error.message,
    });
  }
};

/**
 * Export report
 * @route GET /api/reports/:id/export/:format
 */
const exportReport = async (req, res) => {
  try {
    const { id, format } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    const report = await ReportModel.findById(id).populate("dataset");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    switch (format) {
      case "pdf":
        // Generate PDF logic (placeholder)
        return res.status(501).json({
          success: false,
          message: "PDF export not yet implemented",
        });

      case "html":
        // Generate HTML logic (placeholder)
        return res.status(501).json({
          success: false,
          message: "HTML export not yet implemented",
        });

      case "json":
        return res.status(200).json({
          success: true,
          report,
        });

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported export format",
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting report",
      error: error.message,
    });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
  exportReport,
};
