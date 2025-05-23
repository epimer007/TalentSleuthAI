const mongoose = require("mongoose");

const analysedDataSchema = new mongoose.Schema(
  {
    fullName: String,
    skills: [String],
    fitScore: Number,
    roleMatch: String,
    status: String,
    hrEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalysedData", analysedDataSchema);
