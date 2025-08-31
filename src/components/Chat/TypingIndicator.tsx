import React from 'react';

interface TypingIndicatorProps {
  users: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="flex mb-4 justify-start animate-slide-up">
      <div className="w-8 h-8 mr-3 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {users[0].charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="max-w-xs lg:max-w-md">
        <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500">
            {users.length === 1 ? 'is typing...' : `${users.length} people are typing...`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;