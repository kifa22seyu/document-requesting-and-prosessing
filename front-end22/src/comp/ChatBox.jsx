import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function ChatInterface({ onMessageSent }) {
    // Get user info from context
    const { user, token } = useAuth();
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ... (fetchRecipients and sendMessage functions remain the same) ...
    const fetchRecipients = useCallback(async () => {
        // ... (implementation as before) ...
        if (!token) {
            setError('Not authenticated.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/recipients`, { // Using the updated endpoint
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setRecipients(data);
        } catch (err) {
            console.error('Failed to fetch recipients:', err);
            setError(err.message || 'Failed to load recipients.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchRecipients();
    }, [fetchRecipients]);

    const sendMessage = async (e) => {
        // ... (implementation as before) ...
         e.preventDefault();
        if (!selectedRecipient || !subject.trim() || !message.trim()) {
            alert('Please fill in all fields.');
            return;
        }
        if (!token) {
            setError('Not authenticated.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/messages/send`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientModel: selectedRecipient.model,
                    recipientId: selectedRecipient.id,
                    subject: subject.trim(),
                    content: message.trim(),
                }),
            });
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            alert('Message sent successfully!');
            setSelectedRecipient(null);
            setSubject('');
            setMessage('');
            onMessageSent?.();
        } catch (err) {
            console.error('Failed to send message:', err);
            setError(err.message || 'Failed to send the message.');
            alert(`Error sending message: ${err.message}`);
        }
    };


    return (
        <div style={styles.container}>
            {/* *** ADDED SECTION TO DISPLAY USER INFO *** */}
            {user && ( // Only display if user object exists
                <div style={styles.userInfo}>
                    {/* Adjust property based on what your user object contains */}
                    Logged in as: <strong>{user.name || user.email || 'Current User'}</strong>
                    {user.userType && <span> ({user.userType})</span>}
                </div>
            )}
            {/* ******************************************* */}

            <h2 style={styles.header}>Compose Message</h2>

            {/* Optionally, add a "From" field (usually disabled) */}
            {/*
            <div style={styles.formGroup}>
                <label style={styles.label}>From:</label>
                <input
                    type="text"
                    value={user ? (user.name || user.email) : ''}
                    style={{...styles.input, backgroundColor: '#eee'}} // Style as disabled
                    readOnly // Make it non-editable
                />
            </div>
            */}


            {/* Recipient Dropdown */}
            <div style={styles.formGroup}>
                <label style={styles.label}>To:</label>
                <select
                    value={selectedRecipient ? JSON.stringify(selectedRecipient) : ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            setSelectedRecipient(JSON.parse(e.target.value));
                        } else {
                            setSelectedRecipient(null);
                        }
                    }}
                    style={styles.dropdown}
                    disabled={loading}
                >
                    <option value="">Select Recipient</option>
                    {recipients.map((recipient) => (
                        <option key={`${recipient.model}-${recipient.id}`} value={JSON.stringify(recipient)}>
                            {recipient.name} ({recipient.model})
                        </option>
                    ))}
                </select>
            </div>

            {/* Subject Field */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Subject:</label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject"
                    style={styles.input}
                />
            </div>

            {/* Message Box */}
            <div style={styles.formGroup}>
                <label style={styles.label}>Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    style={styles.textarea}
                />
            </div>

            {/* Send Button */}
            <button
                onClick={sendMessage}
                style={styles.sendButton}
                disabled={loading || !selectedRecipient || !subject.trim() || !message.trim()}
            >
                Send
            </button>

            {/* Loading/Error States */}
            {loading && <p style={styles.placeholderText}>Loading recipients...</p>}
            {error && <p style={styles.errorText}>Error: {error}</p>}
        </div>
    );
}

// Add style for the new user info display
const styles = {
    // ... (keep all previous styles) ...
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        maxWidth: '600px',
        margin: '20px auto',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    userInfo: { // Style for the added user info div
        marginBottom: '15px',
        padding: '8px',
        backgroundColor: '#eef',
        border: '1px solid #dde',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '0.9em',
        color: '#333',
    },
    header: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#333',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555',
    },
    dropdown: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '1em',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '1em',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        height: '150px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        fontSize: '1em',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    sendButton: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        fontSize: '1em',
        transition: 'background-color 0.2s ease',
        opacity: 1,
    },
    placeholderText: {
        textAlign: 'center',
        color: '#666',
        fontSize: '1em',
        marginTop: '20px',
    },
    errorText: {
        color: '#d9534f',
        marginTop: '10px',
        textAlign: 'center',
        fontWeight: 'bold',
    },
};

export default ChatInterface;