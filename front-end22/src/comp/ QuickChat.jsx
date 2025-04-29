// src/comp/QuickChat.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

// --- Helper function for temporary IDs ---
let messageIdCounter = Date.now();
const generateTemporaryId = () => `temp_${messageIdCounter++}`;

// --- Helper function for Initials ---
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// --- Read Receipt SVG Component ---
const ReadReceipt = ({ isRead }) => {
    // (Component code remains the same - omitted for brevity)
    if (isRead) {
      return ( <svg className="w-4 h-4 text-sky-400" /* ... */ >{/* ... paths ... */}</svg> );
    } else {
      return ( <svg className="w-4 h-4 text-gray-400" /* ... */ >{/* ... path ... */}</svg> );
    }
};


// --- Main QuickChat Component ---
const QuickChat = () => {
  const { user: currentUser, token, loading: authLoading, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversations, setConversations] = useState({}); // { contactId: [messageObj] }
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [fetchError, setFetchError] = useState(null); // Stores general fetch errors
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for scrolling

  // Memoized headers for API calls
  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // --- Data Fetching Callbacks ---
  const fetchContacts = useCallback(async () => {
    if (!token || !currentUser) return;
    setLoadingContacts(true);
    setFetchError(null);
    try {
      // Using /api/users endpoint. Ensure backend provides 'actorType' for each user.
      const response = await axios.get(`${API_BASE_URL}/api/users`, authHeaders);
      const fetchedContacts = response.data
        .filter(u => u._id !== currentUser._id) // Exclude self
        .map(u => ({ // Map to consistent frontend structure
            id: u._id, _id: u._id,
            name: u.name || u.fullName || 'Unknown Name', // Handle potential name variations
            email: u.email,
            actorType: u.actorType || 'User', // CRITICAL: Backend MUST provide this reliably
            profilePicture: u.profilePicture,
            online: false, // Presence needs WebSocket implementation
            lastSeen: 'N/A' // Presence needs WebSocket implementation
        }));
      setContacts(fetchedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error.response?.data || error.message);
      setFetchError('Failed to load contacts.');
      if (error.response?.status === 401 && logout) { logout(); } // Handle expired token
    } finally {
      setLoadingContacts(false);
    }
  }, [token, currentUser, authHeaders, logout]);

  const fetchMessages = useCallback(async (contact) => {
    if (!token || !contact?._id) return; // Check contact and its ID
    setLoadingMessages(true);
    setFetchError(null);
    try {
       const recipientId = contact._id;
       const url = `${API_BASE_URL}/api/messages/conversation/${recipientId}`;
       const response = await axios.get(url, authHeaders);
       // Ensure messages are stored under the contact's _id
       setConversations(prev => ({ ...prev, [contact._id]: response.data.messages || [] }));
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      setFetchError(`Failed to load messages for ${contact.name}.`);
       if (error.response?.status === 401 && logout) { logout(); } // Handle expired token
    } finally {
      setLoadingMessages(false);
    }
  }, [token, authHeaders, logout]);

  // --- Scroll Utility ---
  const scrollToBottom = useCallback((behavior = "smooth") => {
    // Added behavior parameter for instant scroll on initial load
    setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior }); }, 50);
  }, []);

  // --- Effects ---

  // Effect 1: Fetch contacts when logged in
  useEffect(() => {
    if (currentUser && token) { fetchContacts(); }
    else { /* Clear state if logged out */ setContacts([]); setConversations({}); setSelectedContact(null); }
  }, [currentUser, token, fetchContacts]);

  // Effect 2: Fetch messages when a contact is selected
  useEffect(() => {
    if (selectedContact && token) {
      // Fetch only if conversation isn't loaded yet
      if (!conversations[selectedContact._id]) { fetchMessages(selectedContact); }
      else { scrollToBottom("auto"); } // Scroll instantly if messages already loaded
    }
  }, [selectedContact, token, fetchMessages, conversations, scrollToBottom]);

  // Effect 3: Scroll to bottom when new messages arrive for the *selected* chat
  useEffect(() => {
    if (selectedContact) { scrollToBottom(); }
     // Dependency is the specific array of messages for the selected contact
  }, [conversations[selectedContact?._id], selectedContact, scrollToBottom]);

  // Effect 4: WebSocket setup and cleanup
  useEffect(() => {
    if (currentUser && token) {
      console.log("Attempting WebSocket connection...");
      // Establish connection, passing token for backend authentication
      socketRef.current = io(SOCKET_URL, { auth: { token: token } });

      socketRef.current.on('connect', () => console.log(`WebSocket connected: ${socketRef.current.id}`));
      socketRef.current.on('disconnect', (reason) => console.log(`WebSocket disconnected: ${reason}`));
      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message, error.data);
        // Handle specific auth errors if backend sends them
        if (error.data?.message === 'Authentication error' && logout) {
             console.error("WebSocket Auth Failed -> Logging out.");
             logout(); // Logout if WebSocket auth fails
        }
      });

      // Listen for 'newMessage' events from server
      socketRef.current.on('newMessage', (newMessage) => {
        console.log('WebSocket received newMessage:', newMessage);
        // Determine the other person in the chat to store the message correctly
        const senderId = newMessage.sender?._id || newMessage.sender;
        const recipientId = newMessage.recipient?._id || newMessage.recipient;
        let conversationPartnerId;

        if (senderId === currentUser._id) conversationPartnerId = recipientId;
        else if (recipientId === currentUser._id) conversationPartnerId = senderId;
        else return; // Message isn't for/from us

        // Update conversation state, adding the new message
        setConversations(prev => {
            const existing = prev[conversationPartnerId] || [];
            // Prevent adding duplicate messages (e.g., if received via API and WS)
            if (existing.some(msg => msg._id === newMessage._id)) return prev;
            return { ...prev, [conversationPartnerId]: [...existing, newMessage] };
        });
        // Scrolling is handled by Effect 3
      });

      // Cleanup function: Disconnect socket when component unmounts or user logs out
      return () => {
        if (socketRef.current) {
          console.log("Disconnecting WebSocket...");
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } else {
       // Ensure socket is disconnected if user logs out while component is mounted
       if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
       }
    }
  }, [currentUser, token, logout]); // Dependencies: User login state and token

  // --- Memoized Computations ---

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!currentUser) return [];
    return contacts.filter(contact =>
        (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contacts, searchTerm, currentUser]);

  // Get messages for the currently selected chat
  const currentChatMessages = useMemo(() => {
    if (!selectedContact?._id) return [];
    return conversations[selectedContact._id] || [];
  }, [selectedContact, conversations]);


  // --- Event Handlers ---

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageContent = newMessage.trim();
    // Ensure all required data is present
    if (!messageContent || !selectedContact?._id || !selectedContact?.actorType || !currentUser?._id || !currentUser?.actorType || !token) {
      console.warn("Send message check failed:", { messageContent, selectedContact, currentUser, token });
      return;
    }

    const tempId = generateTemporaryId();
    // Optimistic message object
    const optimisticMessage = {
      _id: tempId, sender: currentUser._id, senderModel: currentUser.actorType,
      recipient: selectedContact._id, recipientModel: selectedContact.actorType,
      content: messageContent, createdAt: new Date().toISOString(), read: false, isOptimistic: true
    };

    // Add optimistic message to UI immediately
    setConversations(prev => ({ ...prev, [selectedContact._id]: [...(prev[selectedContact._id] || []), optimisticMessage] }));
    setNewMessage(''); // Clear input

    try {
       // Prepare payload for backend
       const payload = { recipientId: selectedContact._id, recipientModel: selectedContact.actorType, content: messageContent };
       // Send to backend API
       const response = await axios.post(`${API_BASE_URL}/api/messages`, payload, authHeaders);
       const savedMessage = response.data.message; // Get confirmed message from backend

       // Replace optimistic message with confirmed one
       if (savedMessage) {
           setConversations(prev => {
               const msgs = prev[selectedContact._id] || [];
               // Find and replace based on tempId
               return { ...prev, [selectedContact._id]: msgs.map(msg => msg._id === tempId ? savedMessage : msg)};
           });
       } else {
           console.warn("Message sent, but no confirmation message received from backend.");
       }
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      setFetchError('Failed to send message.');
      // Revert optimistic update on error
      setConversations(prev => {
          const msgs = prev[selectedContact._id] || [];
          return { ...prev, [selectedContact._id]: msgs.filter(msg => msg._id !== tempId)};
      });
      setNewMessage(messageContent); // Put message back in input
      if (error.response?.status === 401 && logout) { logout(); } // Handle auth error
    }
  };

  // Handle selecting a contact from the list
  const handleSelectContact = (contact) => {
      if (selectedContact?._id !== contact._id) {
        setSelectedContact(contact);
        setFetchError(null); // Clear errors when changing contact
      }
  }

  // --- Conditional Renders for Loading/Auth ---

  if (authLoading) {
    return ( <div className="flex h-screen items-center justify-center bg-gray-100"><div className="text-lg font-medium text-gray-600">Initializing Chat...</div></div> );
  }

  if (!currentUser) {
     return ( <div className="flex h-screen items-center justify-center bg-gray-100"><div className="text-center"><h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Quick Chat</h2><p className="text-gray-500 mb-4">Please log in to continue.</p>{/* Add Login Link/Button */}</div></div> );
  }

  // --- Main JSX Render ---
  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">

      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        {/* Header */}
        <div className="p-4 text-xl font-bold border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">Quick Chat</div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
           <div className="relative">
            <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {loadingContacts ? ( <div className="p-4 text-center text-gray-500">Loading contacts...</div> )
            : filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
              <div key={contact._id} className={`flex items-center p-3 border-b border-gray-100 cursor-pointer transition-colors duration-150 ease-in-out hover:bg-indigo-50 ${selectedContact?._id === contact._id ? 'bg-indigo-100' : ''}`} onClick={() => handleSelectContact(contact)}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${contact.online ? 'bg-blue-500' : 'bg-gray-400'}`}>
                     {contact.profilePicture && contact.profilePicture !== 'default.jpg' ? (<img src={`${API_BASE_URL}${contact.profilePicture}`} alt={contact.name} className="w-full h-full rounded-full object-cover" />) : (getInitials(contact.name))}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                {/* Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                    <span className={`text-xs flex-shrink-0 ml-2 ${contact.online ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{contact.online ? 'Online' : contact.lastSeen}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.email || 'No email'}</p>
                </div>
              </div>
              ))
            ) : ( <div className="p-4 text-center text-gray-500">{fetchError || 'No contacts found.'}</div> )
          }
        </div>

        {/* Current User Profile */}
        <div className="p-3 border-t border-gray-200 bg-gray-100 flex items-center">
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {currentUser.profilePicture && currentUser.profilePicture !== 'default.jpg' ? ( <img src={`${API_BASE_URL}${currentUser.profilePicture}`} alt={currentUser.name || currentUser.fullName} className="w-full h-full rounded-full object-cover" />) : (getInitials(currentUser.name || currentUser.fullName))}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-100"></div>
            </div>
            <div className="ml-3 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{currentUser.name || currentUser.fullName}</h3>
                <p className="text-xs text-green-600 capitalize">Online</p>
            </div>
            <button onClick={logout} className="ml-auto p-1 rounded-full hover:bg-gray-200 text-gray-500" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
      </div> {/* End Sidebar */}


      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        {/* Chat Header */}
        {selectedContact ? (
          <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm flex-shrink-0">
             <div className="relative flex-shrink-0">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${selectedContact.online ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  {selectedContact.profilePicture && selectedContact.profilePicture !== 'default.jpg' ? (<img src={`${API_BASE_URL}${selectedContact.profilePicture}`} alt={selectedContact.name} className="w-full h-full rounded-full object-cover" />) : (getInitials(selectedContact.name))}
               </div>
               <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${selectedContact.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <div className="ml-3 min-w-0">
              <h2 className="font-semibold text-gray-800 truncate">{selectedContact.name}</h2>
              <p className="text-sm text-gray-500">{selectedContact.online ? 'Online' : `Last seen ${selectedContact.lastSeen}`}</p>
            </div>
            <div className="ml-auto flex space-x-2"> {/* Options Button */}
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg></button>
            </div>
          </div>
        ) : ( <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm h-[73px] flex-shrink-0"><div className="text-gray-500">Select a contact to start chatting</div></div> )}

        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto messages-container space-y-2 bg-blue-50">
          {fetchError && <div className="p-4 text-center text-red-600 bg-red-100 rounded">{fetchError}</div>}
          {selectedContact ? (
             loadingMessages ? ( <div className="p-4 text-center text-gray-500">Loading messages...</div> )
             : currentChatMessages.length > 0 ? (
                <>
                  {currentChatMessages.map((message, index) => {
                    const senderId = message.sender?._id || message.sender;
                    const isCurrentUser = senderId === currentUser._id;
                    const previousSenderId = index > 0 ? (currentChatMessages[index - 1].sender?._id || currentChatMessages[index - 1].sender) : null;
                    const showAvatar = !isCurrentUser && (index === 0 || senderId !== previousSenderId);
                    const addMarginTop = index > 0 && senderId !== previousSenderId;
                    return (
                      <div key={message._id} className={`flex items-end ${isCurrentUser ? 'justify-end' : 'justify-start'} ${addMarginTop ? 'mt-3' : ''}`}>
                        <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">{/* Avatar Area */}
                          {showAvatar && (<div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-xs mb-[2px]">{getInitials(selectedContact?.name)}</div>)}
                        </div>
                        <div className={`max-w-[70%] lg:max-w-[60%] px-3 py-2 rounded-lg shadow-sm relative ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'} ${message.isOptimistic ? 'opacity-75' : ''}`}> {/* Message Bubble */}
                           {message.isOptimistic && (<div className="absolute -left-5 top-1/2 transform -translate-y-1/2"><svg className="animate-spin h-3 w-3 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>)}
                           <div className="break-words text-sm leading-snug">{message.content}</div>
                           <div className={`text-xs mt-1 flex items-center ${isCurrentUser ? 'text-blue-100 justify-end' : 'text-gray-400 justify-start'}`}>
                            <span>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Sending...'}</span>
                            {isCurrentUser && !message.isOptimistic && (<span className="ml-1.5 flex-shrink-0"><ReadReceipt isRead={message.read} /></span>)}
                           </div>
                        </div>
                         <div className={`w-8 flex-shrink-0 ml-2 ${!isCurrentUser ? 'hidden' : ''}`}></div>{/* Spacer */}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-1" /> {/* Scroll Target */}
                </>
              ) : ( /* No Messages Placeholder */ <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z"/></svg><p className="text-sm">No messages with {selectedContact.name} yet.</p><p className="text-xs mt-1">Send a message!</p></div> )
           ) : ( /* No Contact Selected Placeholder */ <div className="flex flex-col items-center justify-center h-full text-center text-gray-500"><svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg><p className="text-lg font-medium">Welcome!</p><p className="text-sm mt-1">Select a contact to chat.</p></div> )}
        </div>

        {/* Message Input Form */}
        {selectedContact && (
           <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white flex items-center space-x-3 flex-shrink-0">
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 flex-shrink-0" title="Attach file (dummy)"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Message ${selectedContact.name}...`} className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-sm" autoComplete="off" disabled={!currentUser || !token} />
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 flex-shrink-0" title="Add emoji (dummy)"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.75.75 0 10-1.06 1.06 3.5 3.5 0 01-4.95 0 .75.75 0 10-1.06-1.06 5 5 0 007.07 0z" clipRule="evenodd" /></svg></button>
            <button type="submit" className={`p-2 rounded-full text-white flex-shrink-0 transition-colors duration-150 ease-in-out ${newMessage.trim() && currentUser && token ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed opacity-70'}`} disabled={!newMessage.trim() || !currentUser || !token} aria-label="Send message"><svg className="w-5 h-5 transform rotate-45" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 16.571V11a1 1 0 112 0v5.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
          </form>
        )}
      </div> {/* End Main Chat Area */}

    </div> // End Outer Container
  );
};

export default QuickChat;