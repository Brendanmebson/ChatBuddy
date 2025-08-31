import React, { useState } from "react";
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { useChat } from "../../contexts/ChatContext";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  onMobileBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onMobileBack }) => {
  const { conversations, activeConversationId, currentUser } = useChat();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== currentUser.id
  );

  if (!activeConversation || !otherParticipant) return null;

  const getStatusText = () => {
    switch (otherParticipant.status) {
      case "online":
        return "Online";
      case "away":
        return "Away";
      case "offline":
        return otherParticipant.lastSeen
          ? `Last seen ${formatDistanceToNow(otherParticipant.lastSeen, {
              addSuffix: true,
            })}`
          : "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="px-6 py-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {onMobileBack && (
            <button
              onClick={onMobileBack}
              aria-label="Back"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Avatar with status indicator */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold">
                {otherParticipant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white transition-colors ${
                otherParticipant.status === "online"
                  ? "bg-green-500"
                  : otherParticipant.status === "away"
                  ? "bg-yellow-400"
                  : "bg-gray-400"
              }`}
            />
          </div>

          {/* Name + status */}
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">
              {otherParticipant.name}
            </h3>
            <p className="text-xs text-gray-500">{getStatusText()}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Start voice call"
          >
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Start video call"
          >
            <Video className="w-5 h-5 text-gray-600" />
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => alert("View Profile")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  View Profile
                </button>
                <button
                  onClick={() => alert("Mute Notifications")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Mute Notifications
                </button>
                <button
                  onClick={() => alert("Block User")}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Block User
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
