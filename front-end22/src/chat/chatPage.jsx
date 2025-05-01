import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FiSend, FiPaperclip, FiX, FiUser, FiMessageSquare } from 'react-icons/fi';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Get current user info
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = localStorage.getItem('token');

  // Initialize socket connection
  useEffect(() => {
    if (!userInfo || !token) {
      navigate('/login');
      return;
    }

    const newSocket = io('http://localhost:8000', {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Update last message in conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId 
            ? { ...conv, lastMessage: message } 
            : conv
        )
      );
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError('Connection error. Please refresh the page.');
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [token, navigate]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/api/message/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    if (token) fetchConversations();
  }, [token]);

  // Fetch messages when conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        const { data } = await axios.get(
          `http://localhost:8000/api/message/conversation/${activeConversation._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(data.messages);
        
        // Mark messages as read
        if (data.unreadCount > 0) {
          await axios.patch(
            `http://localhost:8000/api/message/conversation/${activeConversation._id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Update unread count in conversations list
          setConversations(prev => 
            prev.map(conv => 
              conv._id === activeConversation._id 
                ? { ...conv, unreadCount: 0 } 
                : conv
            )
          );
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      }
    };

    fetchMessages();
  }, [activeConversation, token]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.user._id !== userInfo._id);
    return otherParticipant?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;

    try {
      const messageData = {
        conversationId: activeConversation._id,
        content: newMessage,
        receiver: activeConversation.participants.find(p => p.user._id !== userInfo._id).user._id
      };

      // Optimistic UI update
      const tempMessage = {
        ...messageData,
        _id: Date.now().toString(), // Temporary ID
        sender: userInfo._id,
        createdAt: new Date().toISOString(),
        read: false
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Send via socket
      socket.emit('sendMessage', messageData);

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Start a new conversation
  const startNewConversation = async (userId) => {
    try {
      const { data } = await axios.post(
        'http://localhost:8000/api/message/conversation',
        { participantId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConversations(prev => [data, ...prev]);
      setActiveConversation(data);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="mt-2 relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full p-2 pl-8 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiUser className="absolute left-2 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conv => {
            const otherParticipant = conv.participants.find(p => p.user._id !== userInfo._id);
            return (
              <div
                key={conv._id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 flex items-center ${
                  activeConversation?._id === conv._id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setActiveConversation(conv)}
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {otherParticipant?.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{otherParticipant?.user?.name || 'Unknown'}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <div className="ml-2 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center bg-white">
              {(() => {
                const otherParticipant = activeConversation.participants.find(
                  p => p.user._id !== userInfo._id
                );
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      {otherParticipant?.user?.name?.charAt(0) || 'U'}
                    </div>
                    <h3 className="font-medium">{otherParticipant?.user?.name || 'Unknown'}</h3>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message._id}
                    className={`mb-4 flex ${
                      message.sender === userInfo._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === userInfo._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === userInfo._id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                  <FiPaperclip size={20} />
                </button>
                <input
                  type="text"
                  className="flex-1 p-2 border rounded-lg mx-2"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={!newMessage.trim()}
                >
                  <FiSend size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <FiMessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Select a conversation</h3>
              <p className="text-gray-500">or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Error modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Error</h3>
              <button onClick={() => setError('')} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => setError('')}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;