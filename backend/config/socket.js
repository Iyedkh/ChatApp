const { Server } = require("socket.io");
const http = require('http');
const express = require('express');


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://illustrious-maamoul-c1fa94.netlify.app"],

    credentials: true
  },
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