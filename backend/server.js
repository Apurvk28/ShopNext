import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";

dotenv.config();

// Verify critical environment variables
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
for (const envVar of requiredEnv) {
    if (!process.env[envVar] && !process.env[`MONGODB_URI`]) {
        console.error(`[CRITICAL ERROR] Missing required environment variable: ${envVar}`);
    }
}

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(helmet());

// Restrictive CORS configuration
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(url => url.trim())
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps or curl) or if origin is in whitelist
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy violation: origin not permitted"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

// Body parsing with payload size limits to mitigate DoS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again later" }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20, // 20 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many authentication attempts. Please try again after 15 minutes." }
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);    
app.use("/api/orders", orderRoutes);    
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Internal Server Error:", err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: process.env.NODE_ENV === "production"
            ? "An unexpected error occurred"
            : err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
