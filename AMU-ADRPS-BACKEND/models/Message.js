// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References your existing User model
    required: [true, 'Message must have a sender.'],
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References your existing User model
    required: [true, 'Message must have a receiver.'],
  },
  content: {
    type: String,
    required: [true, 'Message content cannot be empty.'],
    trim: true,
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Optional: Indexing for faster querying of conversations
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: 1 });


const Message = mongoose.model('Message', messageSchema);

module.exports = Message;