const express = require('express');
const { protectRoute } = require('../middleware/auth.middleware');
const { 
  getUsersForSidebar, 
  getMessages, 
  sendMessage,
  updateMessage,
  deleteMessage
} = require('../controllers/message.controller');

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.put("/:messageId", protectRoute, updateMessage);
router.delete("/:messageId", protectRoute, deleteMessage);

module.exports = router;