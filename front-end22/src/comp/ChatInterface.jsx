// src/components/ChatInterface.js (Example Path)
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi'; // Example icons

const ChatInterface = () => {
  // Access context if needed (e.g., user info)
  const { userData } = useOutletContext(); 

  // Basic state for the input message (in a real app, this would be more complex)
  const [message, setMessage] = React.useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    console.log(`Sending message from ${userData?.name || 'User'}:`, message);
    // Add logic here to actually send the message via WebSocket, API, etc.
    setMessage(''); // Clear input after sending
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Chat</h2>
      
      <div className="flex-1 flex border rounded-lg overflow-hidden">
        {/* Sidebar/Contact List (Placeholder) */}
        <aside className="w-1/4 border-r bg-gray-50 p-3 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">Contacts</h3>
          {/* Replace with actual contact list */}
          <ul>
            <li className="p-2 hover:bg-gray-200 rounded cursor-pointer text-sm">Alice Smith</li>
            <li className="p-2 bg-blue-100 rounded cursor-pointer text-sm font-medium">Bob Johnson (Active)</li>
            <li className="p-2 hover:bg-gray-200 rounded cursor-pointer text-sm">Support Team</li>
          </ul>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Message Display Area (Placeholder) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
            {/* Example Messages */}
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3 max-w-xs lg:max-w-md">
                <p className="text-sm text-gray-800">Hi Bob, can you check the status of application #123?</p>
                <p className="text-xs text-gray-500 text-right mt-1">Alice - 10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs lg:max-w-md">
                <p className="text-sm">Sure Alice, checking now. Looks like it's pending final review.</p>
                 <p className="text-xs text-blue-100 text-right mt-1">You - 10:31 AM</p>
              </div>
            </div>
             <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3 max-w-xs lg:max-w-md">
                <p className="text-sm text-gray-800">Okay, thanks!</p>
                 <p className="text-xs text-gray-500 text-right mt-1">Alice - 10:32 AM</p>
              </div>
            </div>
            {/* Add more message bubbles */}
          </div>

          {/* Message Input Area */}
          <div className="border-t p-3 bg-gray-50">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                 <FiPaperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
               <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                 <FiSmile className="h-5 w-5" />
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={message.trim() === ''}
               >
                <FiSend className="h-5 w-5" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatInterface;