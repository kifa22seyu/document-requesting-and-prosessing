// SentMessage.jsx
import React, { useState, useEffect } from 'react'; // Removed unused useEffect if socket logic is only for sending
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { io } from 'socket.io-client';

// --- FIXED: Use Vite env var ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SentMessage = ({ recipientId, recipientModel, recipientName, onClose, onMessageSent }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // --- Effect for Socket Connection (Simplified for Sending Only) ---
  useEffect(() => {
    if (!currentUser?.token) {
        console.warn("No token for SentMessage socket.");
        return; // Don't connect without token
    }

    // Establish connection when component mounts (if needed for sending)
    const newSocket = io(API_BASE_URL, {
      auth: { token: currentUser.token },
      // Consider 'forceNew: true' if you want a fresh connection each time
      // or reuse the socket from a context if available
      reconnection: false // May not need reconnection if only used for short-lived sending
    });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('SentMessage socket connected:', newSocket.id));
    newSocket.on('connect_error', (err) => {
        console.error('SentMessage socket connect_error:', err);
        setError(`Failed to connect to chat service: ${err.message}`);
    });
    newSocket.on('disconnect', (reason) => console.log('SentMessage socket disconnected:', reason));


    // Cleanup: Disconnect when the component unmounts
    return () => {
      if (newSocket) {
          console.log('Disconnecting SentMessage socket...');
          newSocket.disconnect();
      }
      setSocket(null);
    };
  }, [currentUser?.token]); // Dependency on token


  // --- Handle Sending Message ---
  const handleSendMessage = () => { // Removed async as emit is non-blocking
    if (!message.trim() || !socket || !socket.connected || !currentUser?.id || !currentUser?.model || !recipientId || !recipientModel) {
        setError('Cannot send message. Check connection, recipient, and message content.');
        console.warn("Send message requirements not met", {message, socketConnected: socket?.connected, user: currentUser, recipientId, recipientModel});
        return;
    }

    setLoading(true);
    setError(null);

    const messageData = {
      recipientId,
      recipientModel,
      content: message.trim(),
      tempId: `temp_${Date.now()}_${Math.random().toString(16).substring(2)}` // Include tempId
    };

    // Emit the message via socket
    socket.emit('sendMessage', messageData, (ack) => {
        // Optional: Handle acknowledgment from server if implemented
        if (ack?.error) {
            console.error('Server acknowledgment error:', ack.error);
            setError(`Server Error: ${ack.error}`);
            setLoading(false);
        } else {
            console.log('Message sent successfully (emit complete).');
            // Optimistically update parent component IF callback provided
            if (onMessageSent) {
                onMessageSent({
                _id: messageData.tempId, // Use tempId for optimistic key
                tempId: messageData.tempId,
                sender: currentUser.id,
                senderModel: currentUser.model,
                recipient: recipientId,
                recipientModel,
                content: messageData.content,
                createdAt: new Date().toISOString(),
                isOptimistic: true
                });
            }
            setMessage(''); // Clear input
            setLoading(false);
            if (onClose) onClose(); // Close modal
        }
    });

    // Handle potential immediate socket errors (less common for emit)
    // The 'messageError' listener on the main Inbox/Context might be better for handling server-side processing errors.
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Send message to <span className="font-semibold">{recipientName || 'Recipient'}</span>
        </h3>
        {/* Optional close button in header */}
        {onClose && (
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        )}
      </div>

      <div className="mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Message content"
        />
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            type="button" // Ensure it doesn't submit if inside another form
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" // Adjusted focus ring
          >
            Cancel
          </button>
        )}
        <button
          type="button" // Ensure it doesn't submit if inside another form
          onClick={handleSendMessage}
          disabled={!message.trim() || loading || !socket?.connected} // Disable if no message, loading, or socket not connected
          className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </div>
    </div>
  );
};

export default SentMessage;