const express = require("express");
const router = express.Router();
const AnalysedData = require("../models/AnalysedData");

// Save analysed data
router.post("/mdb", async (req, res) => {
  try {
    console.log(req.body);
    const data = new AnalysedData(req.body);
    await data.save();
    res.status(201).json({ message: "Analysed data saved successfully", data });
  } catch (err) {
    res.status(500).json({ message: "Failed to save analysed data" });
  }
});

// Optional: Get all analysed data
router.get("/", async (req, res) => {
  try {
    const allData = await AnalysedData.find().sort({ createdAt: -1 });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analysed data" });
  }
});

module.exports = router;
