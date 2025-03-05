const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const generateRoute = require("./routes/generate");
app.use("/api", generateRoute);  // Prefix all API calls with /api

// Root Route
app.get("/", (req, res) => {
  res.send("Excuse Generator API is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
