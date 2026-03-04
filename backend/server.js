const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

/* --------------------------
   SERVE FRONTEND FILES
--------------------------- */

app.use(express.static(path.join(__dirname, "../frontend")));

/* --------------------------
   ROOT ROUTE
--------------------------- */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* --------------------------
   MONGODB CONNECTION
--------------------------- */

const MONGO_URI =
  "mongodb+srv://lohith:lohith0562.@cluster0.jglbaic.mongodb.net/farmer-retailer-db?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed!", err);
  });

/* --------------------------
   TEST API
--------------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "Server running",
    project: "Farmer Retailer Booking System",
  });
});

/* --------------------------
   SERVER START
--------------------------- */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Farmer-Retailer Booking System 🚀");
  console.log("Server running on port:", PORT);
  console.log("API path: /api");
  console.log("Health: /api/health");
});
