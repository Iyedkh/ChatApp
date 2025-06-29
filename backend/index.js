const express = require('express');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const { app, server} = require('./config/socket.js')

const path = require('path');

dotenv.config();

const PORT = process.env.PORT;

//const __dirname = path.resolve();

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

if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB()
});