import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../utils/utils";
import { FiEdit, FiTrash2, FiX, FiCheck } from "react-icons/fi";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    updateMessage,
    deleteMessage,
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [messageToDelete, setMessageToDelete] = useState(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages and subscribe to updates when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
      setEditingMessageId(null);
    };
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  const handleEditMessage = (message) => {
    setEditingMessageId(message._id);
    setEditedText(message.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedText("");
  };

  const handleSaveEdit = async (messageId) => {
    if (!editedText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    await updateMessage(messageId, { text: editedText });
    setEditingMessageId(null);
    setEditedText("");
  };

  const handleDeleteClick = (messageId) => {
    setMessageToDelete(messageId);
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete);
      setMessageToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setMessageToDelete(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Delete Confirmation Overlay */}
      {messageToDelete && (
        <div className="absolute inset-0 text-white bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Delete Message</h3>
            <p className="mb-6 text-white">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isMessagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col relative group">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2 max-h-60 object-cover"
                  />
                )}

                {editingMessageId === message._id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="bg-white text-gray-800 p-2 rounded w-full"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(message._id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Cancel edit"
                      >
                        <FiX />
                      </button>
                      <button
                        onClick={() => handleSaveEdit(message._id)}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Save changes"
                      >
                        <FiCheck />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
                    {message.senderId === authUser._id && (
                      <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button
                          onClick={() => handleEditMessage(message)}
                          className="p-1 rounded-full hover:bg-gray-200"
                          aria-label="Edit message"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(message._id)}
                          className="p-1 rounded-full hover:bg-gray-200 text-red-500"
                          aria-label="Delete message"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;