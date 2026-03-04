const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ===== SERVE FRONTEND ===== */
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

/* ===== ROUTES ===== */
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ===== HEALTH CHECK ===== */
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running" });
});

/* ===== MONGODB ===== */
const MONGO_URI =
  "mongodb+srv://lohith:lohith0562.@cluster0.jglbaic.mongodb.net/farmer-retailer-db?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ===== SERVER ===== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
