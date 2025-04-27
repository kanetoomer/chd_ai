const mongoose = require("mongoose");

const VisualizationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["bar", "line", "pie", "scatter", "heatmap", "histogram"],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  data: {
    columns: [String],
    config: mongoose.Schema.Types.Mixed,
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
  },
  imageData: {
    type: String,
  },
});

const InsightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  aiGenerated: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dataset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dataset",
    required: true,
  },
  visualizations: [VisualizationSchema],
  insights: [InsightSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

// Pre-save hook to update lastModified
ReportSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
