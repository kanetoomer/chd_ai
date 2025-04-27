const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const dataParser = require("../utils/dataParser");
const DatasetModel = require("../models/Dataset");
const DatasetRowModel = require("../models/DatasetRow");
const {
  cleanData,
  handleMissingValues,
  standardizeData,
} = require("../utils/dataCleaners");
const { generateSummaryStatistics } = require("../utils/statisticsHelper");

/**
 * Upload and process datasets
 * @route POST /api/datasets/upload
 */
const uploadDatasets = async (req, res) => {
  try {
    const uploadedFiles = req.files;
    const results = [];

    for (const file of uploadedFiles) {
      const filePath = file.path;
      const fileExt = path.extname(file.originalname).toLowerCase();
      let data = [];

      if (fileExt === ".csv") {
        data = await new Promise((resolve, reject) => {
          const results = [];
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => results.push(row))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
        });
      } else if (fileExt === ".data") {
        const fileContent = fs.readFileSync(filePath, "utf8");
        data = dataParser.parse(fileContent);
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Parsed dataset is empty or invalid.");
      }

      const metadata = {
        columnTypes: {},
        summary: {},
      };

      const sample = data[0];
      if (sample) {
        Object.keys(sample).forEach((key) => {
          const value = sample[key];
          if (!isNaN(Number(value))) {
            metadata.columnTypes[key] = "numeric";
          } else if (Date.parse(value)) {
            metadata.columnTypes[key] = "date";
          } else if (typeof value === "boolean") {
            metadata.columnTypes[key] = "boolean";
          } else {
            metadata.columnTypes[key] = "string";
          }
        });
      }

      metadata.summary = generateSummaryStatistics(data);

      // 👉 Save dataset and capture the *saved* dataset
      const savedDataset = await new DatasetModel({
        user: req.user._id,
        name: file.originalname.replace(/\.[^/.]+$/, ""),
        description: req.body.description || "",
        fileName: file.originalname,
        fileSize: file.size,
        fileType: fileExt,
        metadata,
      }).save(); // 🔥 Notice `.save()` directly after `new DatasetModel`

      // 👉 Then safely use savedDataset._id
      const datasetRows = data.map((row) => ({
        datasetId: savedDataset._id,
        row: row,
      }));

      await DatasetRowModel.insertMany(datasetRows);

      fs.unlinkSync(filePath);

      results.push({
        id: savedDataset._id,
        name: savedDataset.name,
        fileType: savedDataset.fileType,
        rowCount: data.length,
        columns: Object.keys(sample),
      });
    }

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      datasets: results,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading files",
      error: error.message,
    });
  }
};

/**
 * Get all datasets for the logged-in user
 * @route GET /api/datasets
 */
const getAllDatasets = async (req, res) => {
  try {
    // ✅ Only get datasets for the logged-in user
    const datasets = await DatasetModel.find(
      { user: req.user._id }, // <-- 🔥 only the user's datasets
      {
        data: 0,
        originalData: 0,
        "metadata.summary.categories": 0,
      }
    ).sort({ createdAt: -1 }); // optional: latest first

    res.status(200).json({
      success: true,
      datasets,
    });
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching datasets",
      error: error.message,
    });
  }
};

/**
 * Get dataset by ID (and paginated data)
 * @route GET /api/datasets/:id
 */
const getDatasetById = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const dataset = await DatasetModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    const totalRows = await DatasetRowModel.countDocuments({
      datasetId: dataset._id,
    });

    const paginatedData = await DatasetRowModel.find({ datasetId: dataset._id })
      .skip(skip)
      .limit(limit)
      .select("row -_id");

    res.status(200).json({
      success: true,
      dataset: {
        _id: dataset._id,
        name: dataset.name,
        description: dataset.description,
        fileName: dataset.fileName,
        fileSize: dataset.fileSize,
        fileType: dataset.fileType,
        createdAt: dataset.createdAt,
        lastModified: dataset.lastModified,
        metadata: dataset.metadata,
        data: paginatedData.map((doc) => doc.row),
        totalRows,
        totalPages: Math.ceil(totalRows / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dataset",
      error: error.message,
    });
  }
};

/**
 * Delete dataset
 * @route DELETE /api/datasets/:id
 */
const deleteDataset = async (req, res) => {
  try {
    const dataset = await DatasetModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    await DatasetRowModel.deleteMany({ datasetId: dataset._id });
    await dataset.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting dataset",
      error: error.message,
    });
  }
};

/**
 * Clean dataset
 * @route POST /api/datasets/:id/clean
 */
const cleanDataset = async (req, res) => {
  try {
    const { operations, missingValueStrategy, columnsToStandardize } = req.body;

    const dataset = await DatasetModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    let datasetRows = await DatasetRowModel.find({ datasetId: dataset._id });

    let processedData = datasetRows.map((doc) => doc.row);

    if (operations.includes("remove_duplicates")) {
      processedData = cleanData.removeDuplicates(processedData);
    }

    if (operations.includes("handle_missing_values")) {
      processedData = handleMissingValues(
        processedData,
        missingValueStrategy || "remove"
      );
    }

    if (operations.includes("standardize")) {
      processedData = standardizeData(
        processedData,
        columnsToStandardize || []
      );
    }

    await DatasetRowModel.deleteMany({ datasetId: dataset._id });

    const cleanedRows = processedData.map((row) => ({
      datasetId: dataset._id,
      row: row,
    }));

    await DatasetRowModel.insertMany(cleanedRows);

    dataset.metadata.summary = generateSummaryStatistics(processedData);
    dataset.lastModified = new Date();
    await dataset.save();

    res.status(200).json({
      success: true,
      message: "Dataset cleaned successfully",
      rowCount: processedData.length,
      columns: processedData.length > 0 ? Object.keys(processedData[0]) : [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cleaning dataset",
      error: error.message,
    });
  }
};

/**
 * Get dataset statistics
 * @route GET /api/datasets/:id/statistics
 */
const getDatasetStatistics = async (req, res) => {
  try {
    const dataset = await DatasetModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    res.status(200).json({
      success: true,
      statistics: dataset.metadata.summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dataset statistics",
      error: error.message,
    });
  }
};

/**
 * Download dataset
 * @route GET /api/datasets/:id/download
 */
const downloadDataset = async (req, res) => {
  try {
    const dataset = await DatasetModel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found",
      });
    }

    const datasetRows = await DatasetRowModel.find({ datasetId: dataset._id });

    const json2csv = require("json2csv").parse;
    const csv = json2csv(datasetRows.map((doc) => doc.row));

    res.header("Content-Type", "text/csv");
    res.attachment(`${dataset.name}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error downloading dataset",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDatasets,
  getAllDatasets,
  getDatasetById,
  deleteDataset,
  cleanDataset,
  getDatasetStatistics,
  downloadDataset,
};
