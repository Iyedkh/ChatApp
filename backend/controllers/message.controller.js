const User = require('../models/user.model');
const Message = require('../models/message.model');
const cloudinary = require('../config/cloudinary');
const { getReceiverSocketId, io } = require('../config/socket');

exports.getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const {id: userToChatId} = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        {senderId: myId, receiverId: userToChatId},
        {senderId: userToChatId, receiverId: myId}
      ]
    }).sort({ createdAt: 1 }); // Sort by creation time

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const {text, image} = req.body;
    const {id: receiverId} = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'message_images',
        resource_type: 'auto'
      });
      imageUrl = uploadResponse.secure_url;
    }
    
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    
    await newMessage.save();

    // Realtime functionality with socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, image } = req.body;
    const userId = req.user._id;

    // Find the message and verify ownership
    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    let updateData = { text };
    
    // Handle image update if provided
    if (image) {
      // Delete old image from Cloudinary if exists
      if (message.image) {
        const publicId = message.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`message_images/${publicId}`);
      }
      
      // Upload new image
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'message_images',
        resource_type: 'auto'
      });
      updateData.image = uploadResponse.secure_url;
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true }
    );

    // Notify both users about the update
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", updatedMessage);
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error in updateMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find the message and verify ownership
    const message = await Message.findOne({
      _id: messageId,
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found or unauthorized" });
    }

    // Delete image from Cloudinary if exists
    if (message.image) {
      const publicId = message.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`message_images/${publicId}`);
    }

    await Message.findByIdAndDelete(messageId);

    // Notify both users about the deletion
    const otherUserId = message.senderId.equals(userId) 
      ? message.receiverId 
      : message.senderId;
    
    const otherUserSocketId = getReceiverSocketId(otherUserId);
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};