Overview
This is a real-time chat application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with Socket.io for live messaging. The app allows users to register, log in, and chat in real-time with other users.

Features
✅ User Authentication – Signup & Login with JWT (JSON Web Token)
✅ Real-time Messaging – Powered by Socket.io
✅ Online Status – Shows when users are online/offline
✅ Chat History – Stores and retrieves past messages
✅ Responsive UI – Works on desktop and mobile

Technologies Used
Frontend: React.js, Socket.io-client, Axios, Tailwind CSS (or another styling library)

Backend: Node.js, Express.js, Socket.io, JWT, Bcrypt

Database: MongoDB (with Mongoose for ODM)

Setup & Installation
Prerequisites
Node.js (v14+)

MongoDB (local or cloud-based like MongoDB Atlas)

Git (optional)

1. Install Dependencies
Backend Setup
bash
cd backend
npm install

Frontend Setup
bash
cd ../frontend
npm install

2. Configure Environment Variables
Backend (.env file in /backend)
env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

3. Run the Application
Start the Backend Server
bash
cd backend
node index.js
Start the Frontend
bash
cd ../frontend
npm run dev


Backend: Runs on http://localhost:5000

Frontend: Runs on http://localhost:5173

Credits
Built entirely by khouildi Iyed as a solo MERN stack project.

# 💬 ChatApp - MERN Stack Deployment Guide

A real-time Chat Application built using the **MERN stack** (MongoDB, Express, React, Node.js) with **Socket.io** for real-time communication.

This guide explains how to deploy:
- **Frontend (React)** on **Netlify**
- **Backend (Express/Node)** on **Render**
- **MongoDB** on **MongoDB Atlas**

---

## 🧱 Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB (MongoDB Atlas)
- Real-time: Socket.io
- Hosting: Netlify (frontend), Render (backend)

---

---

## 🚀 Deployment Instructions

### 🗂️ 1. Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a cluster and a database.
3. Whitelist your IP and create a database user.
4. Get the connection string (e.g. `mongodb+srv://<user>:<password>@cluster.mongodb.net/chatdb`).

---

### 🖥️ 2. Deploy Backend to Render

1. Go to [Render](https://render.com/).
2. Click **"New Web Service"**.
3. Connect your GitHub repo and select the `backend/` directory as the root.
4. Set the environment:
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js` or `npm start`
   - **Environment Variables**:
     ```
     MONGO_URI=<your MongoDB URI>
     PORT=10000
     CLIENT_URL=https://<your-netlify-url>   # Set this after frontend deployment
     ```
5. Add `CORS` support in your backend:
   ```js
   const cors = require('cors');
   app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

🌐 3. Deploy Frontend to Netlify
Go to Netlify.

Click "Add New Site" > "Import from Git".

Select your GitHub repo and the frontend/ folder as the site root.

Set build settings:

Build Command: npm run build

Publish directory: build

Add environment variable:

ini
Copier
Modifier
REACT_APP_API_URL=https://<your-render-backend-url>

app url : https://illustrious-maamoul-c1fa94.netlify.app/login

