import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import experienceRoutes from "./routes/experienceRoutes";
import guideRoutes from "./routes/guideRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import stayRoutes from "./routes/stayRoutes";
import transportRoutes from "./routes/transportRoutes";

dotenv.config();

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

const app: Express = express();
const port = Number(process.env.PORT) || 5001;

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/stays", stayRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const initializeAndStartServer = async () => {
  try {
    console.log(`📡 About to connect to database...`);
    await connectDB();
    console.log("✅ Database initialized");

    console.log(`📡 Starting Express server on port ${port}...`);
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server is now listening on http://localhost:${port}`);
      console.log(`✅ Server is also available at http://127.0.0.1:${port}`);
      console.log(`✅ API available at http://localhost:${port}/api`);
    });

    server.on("error", (error: any) => {
      console.error("❌ Server error:", error);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

console.log("🚀 Starting application initialization...");
initializeAndStartServer();
