import "dotenv/config";

import app from "./app.js";
import connectMongo from "./config/mongo.js";
import prisma from "./config/prisma.js";

const PORT = process.env.PORT || 3000;

// Start both database connections in parallel
async function StartDB() {
  try {
    await Promise.all([
      connectMongo(),
      prisma.$connect(),
    ]);

    console.log("MongoDB + PostgreSQL Connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

StartDB();

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected");
  } finally {
    process.exit(0);
  }
});