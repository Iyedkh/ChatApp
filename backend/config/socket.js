const { Server } = require("socket.io");
const http = require('http');
const express = require('express');


const app = express();
const server = http.createServer(app);

// In your socket.io configuration
const io = new Server(server, {
  cors: {
    origin: [
      'https://illustrious-maamoul-c1fa94.netlify.app',
      'http://localhost:3000' // For local testing
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  cookie: true // Add this to parse cookies
});

// Add authentication middleware for Socket.IO
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('jwt=')[1]?.split(';')[0];
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};


//used to store online users
const userSocketMap ={};

io.on("connection", (socket) => {
  //console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if(userId){
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  }

  // io.emit() is used to send event to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
})
module.exports = {io, app, server,getReceiverSocketId};