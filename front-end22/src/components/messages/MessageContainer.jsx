import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext";
import LogoutButton from "../sidebar/LogoutButton";

const MessageContainer = () => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { authUser } = useAuthContext();

  useEffect(() => {
    return () => setSelectedConversation(null);
  }, [setSelectedConversation]);

  // Add loading state and null checks
  if (!authUser) {
    return (
      <div className='md:min-w-[450px] w-screen p-2.5 pb-12 h-screen flex py-4 rounded-3xl flex-col items-center justify-center'>
        <p className='text-gray-400'>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className='md:min-w-[450px] w-screen p-2.5 pb-12 h-screen flex py-4 rounded-3xl flex-col'>
      {/* User profile section with null checks */}
      <div className='flex px-6 mb-4 items-end justify-between'>
        <div className='flex flex-row shadow-2xl p-2 rounded-3xl gap-4'>
          {authUser.profilePic ? (
            <img
              src={authUser.profilePic}
              alt='profile'
              className='w-12 h-12 rounded-full object-cover'
            />
          ) : (
            <div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center'>
              <span className='text-gray-600 text-xl'>
                {authUser.fullName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div>
            <p className='text-gray-400 text-xl font-bold'>
              {authUser.fullName || 'Unknown User'}
            </p>
            <p className='text-gray-700'>
              @{authUser.username || 'unknown'}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>

      {!selectedConversation ? (
        <NoChatSelected authUser={authUser} />
      ) : (
        <>
          <div className='bg-slate-800 px-4 py-2 mb-2 rounded-lg'>
            <span className='label-text'>To: </span>
            <span className='text-gray-130 font-bold'>
              {selectedConversation.fullName || 'Unknown User'}{' '}
              <span className="text-gray-500">
                ({selectedConversation.username || 'unknown'})
              </span>
            </span>
          </div>
          <Messages />
          <MessageInput />
        </>
      )}
    </div>
  );
};

const NoChatSelected = ({ authUser }) => {
  return (
    <div className='flex items-center justify-center w-full h-screen'>
      <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
        <p>Welcome 👋 {authUser?.fullName || 'User'} ❄</p>
        <p>Select a chat to start messaging</p>
        <TiMessages className='text-3xl md:text-6xl text-center' />
      </div>
    </div>
  );
};

export default MessageContainer;