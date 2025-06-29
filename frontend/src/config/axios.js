import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "https://jaxxx-d5q2.onrender.com", 
  withCredentials: true,
})