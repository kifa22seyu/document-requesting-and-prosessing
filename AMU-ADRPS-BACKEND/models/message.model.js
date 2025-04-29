// File: models/message.model.js
const mongoose = require("mongoose"); // Changed import

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ["User", "Adminrole", "Admin"], // Can reference any of these 3 models
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ["User", "Adminrole", "Admin"], // Can reference any of these 3 models
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message; // Changed export