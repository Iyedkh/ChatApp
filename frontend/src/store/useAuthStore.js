import { create } from 'zustand';
import { axiosInstance } from '../config/axios';
import toast from "react-hot-toast";
import { io } from 'socket.io-client';

const BaseUrl ="https://jaxxx-d5q2.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isUpdatingUser: false,
  isUpdatingRole: false,
  isCheckingAuth: false,
  onlineUsers: [],
  socket: null,
  users: [],
  totalUsers: 0,
  isFetchingUsers: false,

  // Check authentication status
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      console.error("Auth check failed:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // User registration
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // User login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // User logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // Update profile picture
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: { ...get().authUser, profilePic: res.data.profilePic } });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Update user information (name, email, password)
  updateUser: async (data) => {
    set({ isUpdatingUser: true });
    try {
      const res = await axiosInstance.put("/auth/update-user", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update user:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      set({ isUpdatingUser: false });
    }
  },

  // Admin-only: Update user role
  updateUserRole: async (userId, role) => {
    set({ isUpdatingRole: true });
    try {
      const res = await axiosInstance.put(`/auth/${userId}/role`, { role });
      
      // If updating own role, update authUser
      if (get().authUser?._id === userId) {
        set({ authUser: { ...get().authUser, role } });
      }
      
      toast.success("User role updated successfully");
      return res.data;
    } catch (error) {
      console.log("error in update role:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
      throw error;
    } finally {
      set({ isUpdatingRole: false });
    }
  },

  // Socket.io connection management
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BaseUrl, {
      query: {
        userId: authUser._id,
      }
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  // Helper to check if user is admin
  isAdmin: () => {
    return get().authUser?.role === 'admin';
  },
  getUsers: async (page = 1, limit = 10) => {
    set({ isFetchingUsers: true });
    try {
      const res = await axiosInstance.get(`/auth/users?page=${page}&limit=${limit}`);
      set({ 
        users: res.data.users,
        totalUsers: res.data.pagination.totalUsers
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    } finally {
      set({ isFetchingUsers: false });
    }
  },
}));