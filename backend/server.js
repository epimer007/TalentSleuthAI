// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const resumeRoutes = require("./src/routes/resumeRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const auth = require("./src/routes/auth"); // ✅ NEW
const analysedDataRoutes = require("./src/routes/analysedData"); // New route

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/talentsleuth", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/resume", resumeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", auth); // ✅ NEW
app.use("/api/analysedData", analysedDataRoutes); // New

// Default route
app.get("/", (req, res) => {
  res.send("TalentSleuth AI Backend is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
