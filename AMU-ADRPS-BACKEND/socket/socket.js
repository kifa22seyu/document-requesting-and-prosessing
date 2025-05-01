// socket/socket.js
const socketio = require('socket.io');

let io;
const userSocketMap = {}; // { userId: socketId }

const initializeSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Get userId from handshake query
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    // Join conversation rooms
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (userId) {
        delete userSocketMap[userId];
      }
    });
  });
};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

module.exports = {
  initializeSocket,
  getReceiverSocketId,
  io: () => io
};