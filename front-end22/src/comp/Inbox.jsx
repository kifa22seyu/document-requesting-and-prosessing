// src/components/Inbox.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
// --- FIX: Correct the import path/name ---
import ChatInterface from './ChatBox'; // Assuming the compose form is in ChatInterface.jsx
// --- END FIX ---


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = import.meta.env.VITE_BASE_URL || apiUrl.replace('/api', '');
    return baseUrl || 'http://localhost:8000';
};

function Inbox() {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showNewMessage, setShowNewMessage] = useState(false); // State for showing compose message
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConversations = useCallback(async () => {
        // ... (fetchConversations logic remains the same)
        if (!token) {
            setError('Authentication required to view messages.');
            setLoading(false);
            setConversations([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `HTTP error! status: ${response.status}` };
                }
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            data.sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));
            setConversations(data);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError(err.message || 'Failed to load conversations. Please try again.');
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleSelectConversation = (conv) => {
        setShowNewMessage(false); // Hide compose when selecting conversation
        const profilePicBase = getBaseUrl();
        setSelectedConversation({
            otherUserId: conv.otherUserId,
            otherUserModel: conv.otherUserModel,
            otherUserName: conv.otherUserName,
            otherUserProfilePic: conv.otherUserProfilePic
                ? `${profilePicBase}${conv.otherUserProfilePic}`
                : `${profilePicBase}/defaults/admin-default.png`,
        });
    };

    // Triggered by the "New Message" button
    const handleNewMessage = () => {
        setSelectedConversation(null); // Clear any selected conversation
        setShowNewMessage(true); // Show the compose message interface
    };

    // Passed as prop to ChatInterface and called after successful send
    const handleMessageSent = () => {
        setShowNewMessage(false); // Hide compose after sending
        fetchConversations(); // Refresh the conversation list
    };

    const formatTimestamp = (isoString) => {
        // ... (formatTimestamp logic remains the same)
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0 && date.getDate() === now.getDate()) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diffDays < 7 && now.getDay() !== date.getDay()) {
                 return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        } catch (e) {
            console.error('Error formatting date:', isoString, e);
            return 'Invalid date';
        }
    };

    const isLastMessageSentByMe = (lastMessage) => {
        // ... (isLastMessageSentByMe logic remains the same)
        return user && lastMessage?.sender && lastMessage?.senderModel &&
               lastMessage.sender === user.id && lastMessage.senderModel === user.model;
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeaderContainer}>
                    <h2 style={styles.sidebarHeader}>Inbox</h2>
                    {/* Button to trigger showing the compose form */}
                    <button
                        style={styles.newMessageButton}
                        onClick={handleNewMessage}
                    >
                        New Message
                    </button>
                </div>
                {/* Conversation List Rendering Logic... */}
                {loading && <p style={styles.placeholderText}>Loading conversations...</p>}
                {error && !loading && <p style={styles.errorText}>Error: {error}</p>}
                {!loading && !error && conversations.length === 0 && (
                    <p style={styles.placeholderText}>No conversations found.</p>
                )}
                {!loading && !error && conversations.length > 0 && (
                     <ul style={styles.conversationList}>
                        {conversations.map((conv) => {
                            const profilePicBase = getBaseUrl();
                            const profilePicUrl = conv.otherUserProfilePic
                                ? `${profilePicBase}${conv.otherUserProfilePic}`
                                : `${profilePicBase}/defaults/admin-default.png`;

                            const isSelected = selectedConversation?.otherUserId === conv.otherUserId &&
                                               selectedConversation?.otherUserModel === conv.otherUserModel;

                            return (
                                <li
                                    key={`${conv.otherUserModel}-${conv.otherUserId}`}
                                    style={isSelected ? styles.selectedConversationItem : styles.conversationItem}
                                    onClick={() => handleSelectConversation(conv)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectConversation(conv)}
                                    aria-current={isSelected ? 'page' : undefined}
                                >
                                    <img
                                        src={profilePicUrl}
                                        alt={`${conv.otherUserName}'s profile`}
                                        style={styles.profilePic}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = `${getBaseUrl()}/defaults/admin-default.png`;
                                        }}
                                    />
                                    <div style={styles.conversationDetails}>
                                        <span style={styles.userName}>
                                            {conv.otherUserName || 'Unknown User'}
                                            <span style={styles.userModel}> ({conv.otherUserModel})</span>
                                        </span>
                                        <p style={styles.lastMessage}>
                                            {user && isLastMessageSentByMe(conv.lastMessage) ? 'You: ' : ''}
                                            {conv.lastMessage?.content?.substring(0, 35) ?? 'No messages yet'}
                                            {conv.lastMessage?.content?.length > 35 ? '...' : ''}
                                        </p>
                                    </div>
                                    <span style={styles.timestamp}>
                                        {formatTimestamp(conv.lastMessage?.createdAt)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Main Chat Area */}
            <div style={styles.chatWindowArea}>
                {selectedConversation ? (
                    // Render ChatWindow if a conversation is selected
                    <ChatWindow
                        key={`${selectedConversation.otherUserModel}-${selectedConversation.otherUserId}`}
                        conversationDetails={selectedConversation}
                    />
                ) : showNewMessage ? (
                    // Render ChatInterface (compose form) if "New Message" was clicked
                    <ChatInterface onMessageSent={handleMessageSent} />
                ) : (
                    // Render placeholder if nothing is selected and not composing
                    <div style={styles.placeholderContainer}>
                        <h3 style={styles.placeholderTitle}>Select a conversation to view messages</h3>
                        <p style={styles.placeholderSubtitle}>or click "New Message" to compose one</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Styles (remain exactly the same)
const styles = {
    // ... (all styles are the same as before)
    container: {
        display: 'flex',
        height: 'calc(100vh - 60px)',
        maxHeight: 'calc(100vh - 60px)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#f0f2f5',
        color: '#1c1e21',
    },
    sidebar: {
        width: '350px',
        minWidth: '300px',
        borderRight: '1px solid #d1d7dc',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    sidebarHeaderContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #e4e6eb',
        backgroundColor: '#ffffff',
        flexShrink: 0,
    },
    sidebarHeader: {
        fontSize: '1.3em',
        fontWeight: '600',
        color: '#050505',
        margin: 0,
    },
    newMessageButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9em',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
        '&:hover': {
             backgroundColor: '#0056b3',
        }
    },
    conversationList: {
        listStyle: 'none',
        padding: '8px 0',
        margin: 0,
        flexGrow: 1,
        overflowY: 'auto',
    },
    conversationItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        borderBottom: '1px solid #f0f2f5',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease-out',
        '&:hover': {
            backgroundColor: '#f0f2f5',
        },
    },
    selectedConversationItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        borderBottom: '1px solid #f0f2f5',
        cursor: 'pointer',
        backgroundColor: '#e7f3ff',
        borderLeft: '3px solid #007bff',
        paddingLeft: '12px',
    },
    profilePic: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        marginRight: '12px',
        objectFit: 'cover',
        backgroundColor: '#e4e6eb',
        flexShrink: 0,
    },
    conversationDetails: {
        flexGrow: 1,
        overflow: 'hidden',
        paddingRight: '10px',
    },
    userName: {
        fontWeight: '600',
        fontSize: '1em',
        color: '#050505',
        display: 'block',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userModel: {
        fontSize: '0.8em',
        color: '#606770',
        fontWeight: 'normal',
    },
    lastMessage: {
        fontSize: '0.9em',
        color: '#606770',
        margin: '2px 0 0 0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    timestamp: {
        fontSize: '0.75em',
        color: '#606770',
        alignSelf: 'flex-start',
        paddingTop: '2px',
        flexShrink: 0,
    },
    chatWindowArea: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#ffffff',
    },
    placeholderContainer: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#606770',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f0f2f5',
    },
    placeholderTitle: {
        fontSize: '1.4em',
        fontWeight: '500',
        color: '#050505',
        marginBottom: '10px',
    },
    placeholderSubtitle: {
        fontSize: '1em',
        color: '#606770',
    },
    // You might want to rename this style if ChatInterface uses different container styles
    // but for now it works as ChatInterface provides its own container styling.
    // chatBoxWrapper: {
    //     width: '100%',
    //     maxWidth: '700px',
    //     padding: '20px',
    //     backgroundColor: '#ffffff',
    //     borderRadius: '8px',
    //     boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    // },
    placeholderText: {
        padding: '20px',
        color: '#606770',
        textAlign: 'center',
        fontSize: '0.95em',
    },
    errorText: {
        color: '#d9534f',
        padding: '15px',
        margin: '10px',
        textAlign: 'center',
        fontWeight: '500',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
    },
};

export default Inbox;