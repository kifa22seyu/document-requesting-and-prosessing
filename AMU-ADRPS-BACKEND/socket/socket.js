// File: socket/socket.js
const { Server } = require("socket.io");
const http = require("http");
const express = require("express"); // Need express to create the initial app instance conceptually

const app = express(); // We don't actually run this app, just need it for http server creation pattern
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // Make sure this matches your frontend URL
        origin: ["http://localhost:3000", "YOUR_FRONTEND_DEPLOYED_URL_IF_ANY"],
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {}; // {userId: socketId}

const getReceiverSocketId = (receiverId) => {
    // Ensure receiverId is treated as a string if it comes in as ObjectId
    return userSocketMap[String(receiverId)];
};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        console.log(`Mapping userId ${userId} to socketId ${socket.id}`);
        userSocketMap[String(userId)] = socket.id; // Store userId as string key
    } else {
        console.warn("Connection attempt without valid userId in query", socket.id);
    }


    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // console.log("Current online users:", Object.keys(userSocketMap));

    // socket.on() is used to listen to the events. can be used both on client and server side
    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        // Find userId associated with this socket.id before deleting
        let disconnectedUserId = null;
        for (const uid in userSocketMap) {
            if (userSocketMap[uid] === socket.id) {
                disconnectedUserId = uid;
                break;
            }
        }
        if (disconnectedUserId) {
            console.log(`Unmapping userId ${disconnectedUserId} from socketId ${socket.id}`);
            delete userSocketMap[disconnectedUserId];
            // Emit updated list after deletion
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            // console.log("Current online users after disconnect:", Object.keys(userSocketMap));
        } else {
             console.warn("Disconnected socket had no associated userId or was undefined", socket.id);
        }

    });
});

// Export the http server instance created here, io, and the helper function
module.exports = { server, io, getReceiverSocketId, app }; // Also export app if needed elsewhere, though less common