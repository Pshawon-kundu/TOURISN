import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import chatRoutes from "./routes/chatRoutes";
import districtRoutes from "./routes/districtRoutes";
import experienceRoutes from "./routes/experienceRoutes";
import foodRoutes from "./routes/foodRoutes";
import guideRoutes from "./routes/guideRoutes";
import nidExtractionRoutes from "./routes/nidExtractionRoutes";
import nidVerificationRoutes from "./routes/nidVerificationRoutes";
import profileRoutes from "./routes/profileRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import stayRoutes from "./routes/stayRoutes";
import transportRoutes from "./routes/transportRoutes";
import {
  cleanupRealtimeService,
  initializeRealtimeService,
} from "./services/realtimeService";

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
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:8084",
    "http://127.0.0.1:8084",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://192.168.0.196:8081",
    "http://192.168.0.196:8084",
    "exp://192.168.0.196:8081",
    "exp://192.168.0.196:8084",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Email"],
};

app.use(cors(corsOptions));

// Security Headers
app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );
  next();
});

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
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/stays", stayRoutes);
app.use("/api/nid", nidVerificationRoutes);
app.use("/api/nid", nidExtractionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/food", foodRoutes);

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

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          "http://localhost:4173",
          "http://127.0.0.1:4173",
          "http://localhost:3000",
          "http://localhost:8081",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Initialize real-time service with Socket.IO
    initializeRealtimeService(io);

    httpServer.on("error", (error: any) => {
      console.error("❌ Server error:", error);
      throw error;
    });

    await new Promise<void>((resolve, reject) => {
      httpServer.listen(port, "0.0.0.0", () => {
        console.log(`✅ Server is now listening on http://localhost:${port}`);
        console.log(`✅ Server is also available at http://127.0.0.1:${port}`);
        console.log(`✅ API available at http://localhost:${port}/api`);
        console.log(`🔌 Socket.IO server is ready for real-time connections`);
        resolve();
      });
      httpServer.on("error", reject);
    });

    console.log("✅ Server successfully started and ready for requests!");

    // Cleanup on shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, cleaning up...");
      cleanupRealtimeService();
      httpServer.close(() => {
        console.log("👋 Server shut down gracefully");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received, cleaning up...");
      cleanupRealtimeService();
      httpServer.close(() => {
        console.log("👋 Server shut down gracefully");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

console.log("🚀 Starting application initialization...");
initializeAndStartServer().catch((error) => {
  console.error("❌ Unhandled initialization error:", error);
  process.exit(1);
});
