import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useTyping } from '../../hooks/useTyping';
// import { Picker } from 'emoji-mart'; // optional, if you add emoji picker

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage, activeConversationId } = useChat();
  const { startTyping, stopTyping } = useTyping(activeConversationId || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeConversationId) {
      sendMessage(message.trim());
      setMessage('');
      stopTyping();
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  if (!activeConversationId) return null;

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-end space-x-3 relative"
      >
        {/* File Upload */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Input Area */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 transition-all"
            rows={1}
          />

          {/* Emoji Picker Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Emoji Picker Dropdown (optional) */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-50">
              {/* <Picker onSelect={(emoji) => setMessage((prev) => prev + emoji.native)} /> */}
              <div className="bg-white shadow-lg rounded-xl p-3 border text-sm">
                (Emoji picker placeholder 😎)
              </div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-full transition-all duration-200 ${
            message.trim()
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
