// File: index.js (Exact code from your last message)

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const personalInformationRoutes = require("./routes/personalInformationRoutes");
const studentInformationRoutes = require("./routes/studentInformationRoutes");
const requestFormRoutes = require("./routes/requestFormRoutes");
const deliveryMethodRoutes = require("./routes/deliveryMethodRoutes");
const graduationVerificationFormRoutes = require("./routes/graduationVerificationFormRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const moderatorAuthRoutes = require("./routes/moderatorAuthRoutes");
const userRoutes = require("./routes/userRoutes");
const adminCrudRoutes = require("./routes/adminRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const settingRoutes = require("./routes/settingRoutes");
const messageRoutes = require("./routes/message.routes");

// --- Import Middleware ---
const authMiddleware = require("./middleware/authMiddleware");

// --- Initialize Express App ---
const app = express();
const port = process.env.PORT || 8000;

// --- Configure Static Directories ---
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(publicDir, 'uploads');
const defaultsDir = path.join(publicDir, 'defaults');

// Ensure directories exist
[publicDir, uploadsDir, defaultsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// --- Database Connection Function ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        });
        console.log("MongoDB connected successfully to database:", mongoose.connection.name);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

// --- Initialize Default Settings ---
const initializeDefaultSettings = async () => {
    try {
        const Setting = require("./models/Setting");
        const defaultImagePath = '/defaults/admin-default.png';
        const fullImagePath = path.join(publicDir, defaultImagePath);
        const sourceImagePath = path.join(__dirname, 'assets/default-profile.png');

        if (!fs.existsSync(fullImagePath)) {
            if (fs.existsSync(sourceImagePath)) {
                fs.copyFileSync(sourceImagePath, fullImagePath);
                console.log("Copied default profile image.");
            } else {
                console.warn("Source default profile image not found at:", sourceImagePath);
            }
        }

        const existingSettings = await Setting.findOne();
        if (!existingSettings) {
            await Setting.create({
                name: "Admin User",
                email: "admin@example.com",
                role: "Administrator",
                profileImage: fs.existsSync(fullImagePath) ? defaultImagePath : null
            });
            console.log("Default admin settings created.");
        } else if (!existingSettings.profileImage && fs.existsSync(fullImagePath)) {
            existingSettings.profileImage = defaultImagePath;
            await existingSettings.save();
            console.log("Added default profile image path to existing settings.");
        } else {
             console.log("Admin settings already exist or default image path already set.");
        }
    } catch (error) {
        console.error("Error initializing default settings:", error);
    }
};

// --- Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(publicDir));

// --- Connect to Database ---
connectDB();

// --- Mongoose Connection Event Listeners ---
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
    initializeDefaultSettings();
});
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected'));
mongoose.connection.on('reconnected', () => console.log('Mongoose reconnected'));
mongoose.connection.on('close', () => console.log('Mongoose connection closed explicitly'));

// --- API Routes ---
app.use("/auth", authRoutes);
app.use("/admin", adminAuthRoutes);
app.use("/moderator", moderatorAuthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admins", adminCrudRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingRoutes);

// Modified routes - removed authMiddleware to match first version
app.use("/api/personal-information", personalInformationRoutes);
app.use("/api/student-information", studentInformationRoutes);
app.use("/api/request-form", requestFormRoutes);
app.use("/api/delivery-method", deliveryMethodRoutes);
app.use("/api/graduation-verification", graduationVerificationFormRoutes);
app.use("/api/message", messageRoutes);

// Example protected route (kept for reference)
app.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "Protected resource accessed!", userId: req.userId });
});

// --- Health Check Endpoint ---
app.get("/health", (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting", 99: "uninitialized" };
    res.status(200).json({
        status: "ok",
        database: dbStatus[dbState] || "unknown",
        dbName: mongoose.connection.name || "N/A",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// --- Root Endpoint ---
app.get("/", (req, res) => {
    res.json({
        message: "AMU ADRPS Backend Service",
        version: "1.0.0",
        status: "running",
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            health: "/health",
            auth: "/auth",
            adminAuth: "/admin",
            moderatorAuth: "/moderator",
            adminCRUD: "/api/admins",
            users: "/api/users",
            announcements: "/api/announcements",
            settings: "/api/settings",
            personalInfo: "/api/personal-information",
            studentInfo: "/api/student-information",
            requestForm: "/api/request-form",
            deliveryMethod: "/api/delivery-method",
            graduationVerification: "/api/graduation-verification"
        }
    });
});

// --- 404 Not Found Handler ---
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Endpoint not found",
        requestedUrl: req.originalUrl
    });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }
    else if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `An account with that ${field} already exists.`;
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid resource ID format provided for path: ${err.path}`;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token.';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired.';
    }

    if (statusCode < 100 || statusCode > 599) {
        console.error(`Invalid status code generated: ${statusCode}, defaulting to 500.`);
        statusCode = 500;
    }

    const response = {
        success: false,
        message: message,
        status: statusCode
    };

    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
});

// --- Start Server ---
let server;
try {
    server = app.listen(port, () => {
        console.log(`\nServer running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        setTimeout(() => {
             console.log(`Database: ${mongoose.connection.name || 'Connecting...'}`);
        }, 500);
        console.log(`PID: ${process.pid}`);
        console.log(`Press Ctrl+C to stop\n`);
    });
} catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
}

// --- Graceful Shutdown Logic ---
const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

    const timeoutId = setTimeout(() => {
        console.error('Could not close connections gracefully within timeout (10s), forcing shutdown');
        process.exit(1);
    }, 10000);

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) {
                        console.error('Error closing Express server:', err);
                        return reject(err);
                    }
                    console.log('Express server closed');
                    resolve();
                });
            });
        } else {
             console.log('Server was not running or already closed.');
        }

        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } else {
             console.log('MongoDB connection was not open.');
        }

        clearTimeout(timeoutId);
        console.log('Graceful shutdown completed.');
        process.exit(0);

    } catch (err) {
        console.error('Error during graceful shutdown:', err);
        clearTimeout(timeoutId);
        process.exit(1);
    }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
  console.error('Unhandled Rejection detected. Initiating shutdown...');
  shutdown('unhandledRejection').catch(() => process.exit(1));
});

process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err, 'Origin:', origin);
  console.error(err.stack);
  console.error('Uncaught Exception detected. Initiating shutdown...');
  shutdown('uncaughtException').catch(() => process.exit(1));
});

module.exports = { app, server };