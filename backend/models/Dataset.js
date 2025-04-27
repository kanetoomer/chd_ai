const mongoose = require("mongoose");

const DatasetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: [".csv", ".data"],
  },
  metadata: {
    columnTypes: {
      type: Map,
      of: String,
    },
    summary: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update lastModified before saving
DatasetSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model("Dataset", DatasetSchema);
