const { generateToken } = require('../config/utils');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary')

exports.signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findOne({ email })
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10)
    const hashedPasword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      email,
      password: hashedPasword,
      role: 'user' // Default role
    })

    if (newUser) {
      generateToken(newUser._id, res)
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        role: newUser.role // Include role in response
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role // Include role in response
    })
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.logout = async (req,res)=>{
  try{
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"User logged out successfully"});
  }catch(error){
    console.log("Error in logout controller", error.message);
    res.status(500).json({message:"Internal Server Error"});
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Basic validation for base64 string
    if (!profilePic.startsWith('data:image/')) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // Check image size (optional)
    const base64Data = profilePic.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const fileSizeInMB = buffer.length / (1024 * 1024);

    if (fileSizeInMB > 5) { // 5MB limit
      return res.status(400).json({ message: "Image size exceeds 5MB limit" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: 'profile_pictures',
      resource_type: 'image',
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select('-password'); // Exclude password from the response

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update profile:", error);
    
    if (error.message.includes('File size too large')) {
      return res.status(400).json({ message: "Image size exceeds maximum allowed" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.checkAuth = async(req, res) =>{
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({message:"Internal Server Error"});
  }
}
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fullName if provided
    if (fullName) {
      user.fullName = fullName;
    }

    // Update email if provided
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update password if currentPassword and newPassword are provided
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      role: updatedUser.role
    });
  } catch (error) {
    console.log("Error in updateUser controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.updateUserRole = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admins can update roles" });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUserRole controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getUsers = async (req, res) => {
  try {
    // Only allow admins to access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users (excluding passwords) with pagination
    const users = await User.find({}, '-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination info
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.log("Error in getUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};