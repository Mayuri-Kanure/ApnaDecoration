// Simple server to test production build
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle React routing - return index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Production server running on http://localhost:${PORT}`);
  console.log(`🌐 Testing Razorpay with LIVE keys`);
  console.log(`⚠️  WARNING: This will use REAL MONEY!`);
  console.log(`📝 Use test amounts only (₹1-₹10)`);
  console.log(`🔗 Navigate to: http://localhost:${PORT}`);
  console.log(`🛑 Press Ctrl+C to stop server`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Server stopped");
  process.exit(0);
});
