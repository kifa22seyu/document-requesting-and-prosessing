/* eslint-disable no-unused-vars */
import React from 'react';
import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

// Changed the function name from Home to Chat
const Chat = () => {
    return (
        <div className=''>
            {/* Consider if this outer div is necessary, it doesn't seem to add styling */}
            <div className='flex flex-col sm:flex-row w-screen h-screen px-8 bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
                <Sidebar />
                <MessageContainer />
            </div>
        </div>
    );
};

// Changed the export to match the new function name
export default Chat;