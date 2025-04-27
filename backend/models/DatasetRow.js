const mongoose = require("mongoose");

const DatasetRowSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dataset",
    required: true,
  },
  row: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("DatasetRow", DatasetRowSchema);
