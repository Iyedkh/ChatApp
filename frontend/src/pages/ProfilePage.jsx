import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Lock, Pencil, X, Check } from "lucide-react";

const ProfilePage = () => {
  const { 
    authUser, 
    isUpdatingProfile, 
    isUpdatingUser,
    updateProfile, 
    updateUser 
  } = useAuthStore();
  
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || '',
    email: authUser?.email || '',
    currentPassword: '',
    newPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return alert('Please select an image file');
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return alert('Image size should be less than 5MB');
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Only validate passwords if they're being changed
    if (formData.currentPassword || formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Only include password fields if they're being changed
      const updateData = {
        fullName: formData.fullName,
        email: formData.email
      };
      
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateUser(updateData);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      fullName: authUser?.fullName || '',
      email: authUser?.email || '',
      currentPassword: '',
      newPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="h-full pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
                </>
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </>
              ) : (
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
              )}
            </div>

            {/* Password Fields (only shown when editing) */}
            {isEditing && (
              <>
                <div className="space-y-1.5">
                  <div className="text-sm text-zinc-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Current Password
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password to make changes"
                    className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm text-zinc-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    New Password
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Leave blank to keep current password"
                    className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs">{errors.newPassword}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex justify-end gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="btn btn-ghost btn-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isUpdatingUser}
                  className="btn btn-primary btn-sm flex items-center gap-1"
                >
                  {isUpdatingUser ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>

          {/* Account Information */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{new Date(authUser?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Role</span>
                <span className="capitalize">{authUser?.role || 'user'}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;