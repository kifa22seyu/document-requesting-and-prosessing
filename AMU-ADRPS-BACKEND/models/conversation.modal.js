const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.model'
    },
    model: {
      type: String,
      required: true,
      enum: ['User', 'Admin', 'Moderator']
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'archivedByModel'
  }],
  archivedByModel: {
    type: String,
    enum: ['User', 'Admin', 'Moderator']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for messages in this conversation
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId'
});

// Indexes
conversationSchema.index({ 'participants.user': 1 });
conversationSchema.index({ updatedAt: -1 });

// Pre-save hook to ensure exactly 2 participants
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    throw new Error('Conversation must have exactly 2 participants');
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;