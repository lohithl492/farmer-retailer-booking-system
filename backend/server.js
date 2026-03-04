const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

/* Serve frontend */
app.use(express.static(path.join(__dirname, "../frontend")));

/* Routes */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/farmer", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/farmer-dashboard.html"));
});

app.get("/retailer", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/retailer-dashboard.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/admin-dashboard.html"));
});

app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
