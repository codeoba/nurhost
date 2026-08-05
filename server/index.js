const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static uploads route (for local storage fallback)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
const filesRouter = require("./routes/files");
const sharesRouter = require("./routes/shares");
const extractRouter = require("./routes/extract");
const downloadsRouter = require("./routes/remoteDownloads");

app.use("/api/files", filesRouter);
app.use("/api/shares", sharesRouter);
app.use("/api/extract", extractRouter);
app.use("/api/downloads", downloadsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NurHost Backend API",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NurHost Backend API server running on port ${PORT}`);
});
