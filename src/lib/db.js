const mongoose = require("mongoose");
require("dotenv").config();

// Get the MongoDB URI from environment variables or set it directly
const dbURI = process.env.DATABASE_URL;

// Create connection
mongoose.connect(dbURI);

// Get default connection instance
const db = mongoose.connection;

// Handle connection error events
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

// Handle successful connection
db.once("open", () => {
  console.log("🟢 Berhasil Terhubung Ke MongoDB");
});
