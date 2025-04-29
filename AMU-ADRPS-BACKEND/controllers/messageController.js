// backend/controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get messages between logged-in user and another user
// @route   GET /api/messages/:otherUserId
// @access  Private (Requires verifyToken middleware)
exports.getMessages = async (req, res) => {
  try {
    const loggedInUserId = req.userId; // From verifyToken middleware
    const otherUserId = req.params.otherUserId;

    if (!loggedInUserId) {
         return res.status(401).json({ success: false, message: 'Not authorized, user ID missing.' });
    }
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
         return res.status(400).json({ success: false, message: 'Invalid other user ID format.' });
    }

    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: loggedInUserId },
      ],
    })
    .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({
        success: true,
        results: messages.length,
        data: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching messages' });
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private (Requires verifyToken middleware)
exports.sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.userId; // From verifyToken middleware

  if (!senderId) {
    return res.status(401).json({ success: false, message: 'Not authorized, user ID missing.' });
  }
  if (!receiverId || !content) {
    return res.status(400).json({ success: false, message: 'Missing receiverId or content' });
  }
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ success: false, message: 'Invalid receiver ID format.' });
  }
  if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot send messages to yourself.' });
  }

  try {
    const receiverUser = await User.findOne({ _id: receiverId, active: { $ne: false } });
    if (!receiverUser) {
        return res.status(404).json({ success: false, message: 'Receiver user not found or is inactive.' });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    // --- Socket.IO Emission ---
    const io = req.app.get('socketio');
    const userSocketMap = req.app.get('userSocketMap');

    if (io && userSocketMap) {
        const senderDetails = await User.findById(senderId).select('name email profilePicture'); // Fields needed by frontend

        const populatedMessage = {
           ...newMessage.toObject(),
           sender: senderDetails ? senderDetails.toObject() : { _id: senderId }
        };

        const receiverSocketId = userSocketMap[receiverId.toString()];
        const senderSocketId = userSocketMap[senderId.toString()];

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', populatedMessage);
        } else {
            console.log(`Receiver ${receiverId} is not online for socket message.`);
        }
        if (senderSocketId) {
             io.to(senderSocketId).emit('newMessage', populatedMessage); // Send back to sender too
         }
    } else {
        console.warn("Socket.IO or userSocketMap not available on req.app");
    }
    // --- End Socket.IO ---

    res.status(201).json({
        success: true,
        data: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: Object.values(error.errors).map(e => e.message).join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server Error sending message' });
  }
};