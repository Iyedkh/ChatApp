import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "https://chatapp-el35.onrender.com",
  withCredentials: true,
})