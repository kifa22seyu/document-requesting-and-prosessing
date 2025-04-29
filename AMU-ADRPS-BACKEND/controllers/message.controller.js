// File: controllers/message.controller.js
const Conversation = require("../models/conversation.modal.js"); // Changed import
const Message = require("../models/message.model.js"); // Changed import
// Import from the new socket module
const { getReceiverSocketId, io } = require("../socket/socket.js"); // Changed import

//send message
exports.sendMessage = async (req, res) => { // Changed export
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
        // Assuming protectAdmin puts the user object on req.user
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);


		// SOCKET IO FUNCTIONALITY
        // Pass the receiverId directly
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
            console.log(`Sending message to receiver ${receiverId} via socket ${receiverSocketId}`);
			// io.to(<socket-id>).emit() is used to send events to a specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		} else {
             console.log(`Receiver ${receiverId} is not online.`);
        }


		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
        console.error(error.stack); // Log stack trace for debugging
		res.status(500).json({ error: "Internal server error" });
	}
};


//get messages
exports.getMessages = async (req, res) => { // Changed export
	try {
		const { id: userToChatId } = req.params;
         // Assuming protectAdmin puts the user object on req.user
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
        console.error(error.stack); // Log stack trace for debugging
		res.status(500).json({ error: "Internal server error" });
	}
};