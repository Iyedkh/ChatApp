const express = require('express');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const { app, server} = require('./config/socket.js')


dotenv.config();

const PORT = process.env.PORT;

// Increase payload limit (e.g., to 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const authRoutes = require('./routes/auth.route.js');
const messageRoutes = require('./routes/message.route.js');
app.use('/auth', authRoutes);
app.use('/message', messageRoutes);


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB()
});