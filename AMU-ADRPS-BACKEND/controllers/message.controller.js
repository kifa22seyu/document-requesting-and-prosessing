const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const { getReceiverSocketId, io } = require('../socket/socket');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachments = [] } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const senderModel = req.user.constructor.modelName; // Gets 'User', 'Admin', etc.

    // Validate receiver exists (you would need to implement this)
    const receiver = await validateReceiver(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      'participants.user': { $all: [senderId, receiverId] },
      'participants.model': senderModel // Ensure same model types
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: senderId, model: senderModel },
          { user: receiverId, model: receiver.constructor.modelName }
        ]
      });
    }

    // Create new message
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      senderModel: senderModel,
      receiver: receiverId,
      receiverModel: receiver.constructor.modelName,
      content,
      attachments
    });

    // Update conversation last message and unread count
    conversation.lastMessage = newMessage._id;
    conversation.unreadCount += 1;
    conversation.updatedAt = new Date();

    // Save both in parallel
    await Promise.all([
      newMessage.save(),
      conversation.save()
    ]);

    // Populate sender info for socket emission
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    // Socket.io notification
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', populatedMessage);
      io.to(receiverSocketId).emit('conversationUpdate', {
        conversationId: conversation._id,
        lastMessage: populatedMessage,
        unreadCount: conversation.unreadCount
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.user': userId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark messages as read if requested
    if (req.query.markRead === 'true') {
      await Message.updateMany(
        { 
          conversationId: conversation._id,
          receiver: userId,
          read: false 
        },
        { $set: { read: true } }
      );
      
      conversation.unreadCount = 0;
      await conversation.save();
    }

    // Get paginated messages
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    const totalMessages = await Message.countDocuments({ conversationId: conversation._id });

    res.status(200).json({
      messages,
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      unreadCount: conversation.unreadCount
    });
  } catch (error) {
    console.error('Error in getMessages controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userModel = req.user.constructor.modelName;

    const conversations = await Conversation.find({
      'participants.user': userId,
      'participants.model': userModel
    })
    .populate({
      path: 'participants.user',
      select: 'name avatar email',
      match: { _id: { $ne: userId } } // Exclude current user
    })
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error in getConversations controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to validate receiver
async function validateReceiver(receiverId) {
  const models = ['User', 'Admin', 'Moderator'];
  for (const model of models) {
    const found = await mongoose.model(model).findById(receiverId);
    if (found) return found;
  }
  return null;
}