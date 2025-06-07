import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../config/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

   updateMessage: async (messageId, updateData) => {
    try {
      const res = await axiosInstance.put(`/message/${messageId}`, updateData);
      set({
        messages: get().messages.map(msg => 
          msg._id === messageId ? res.data : msg
        )
      });
      toast.success("Message updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update message");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/message/${messageId}`);
      set({
        messages: get().messages.filter(msg => msg._id !== messageId)
      });
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // Update your subscribeToMessages to handle updates and deletions
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageUpdated", (updatedMessage) => {
      set({
        messages: get().messages.map(msg => 
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      });
    });

    socket.on("messageDeleted", (deletedMessageId) => {
      set({
        messages: get().messages.filter(msg => msg._id !== deletedMessageId)
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageUpdated");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));