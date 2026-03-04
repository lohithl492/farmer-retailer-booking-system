const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* SERVE FRONTEND */
app.use(express.static(path.join(__dirname, "../frontend")));

/* HOME PAGE */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* HEALTH CHECK */
app.get("/api/health", (req, res) => {
    res.json({ status: "Server Running Successfully" });
});

/* START SERVER */
app.listen(PORT, () => {
    console.log("🚀 Farmer-Retailer Booking System 🚀");
    console.log(`Server running on port: ${PORT}`);
});
