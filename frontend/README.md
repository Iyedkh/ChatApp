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