const User = require('../models/usersModel');
const fs = require('fs');
const path = require('path');

// الحصول على ملف التعريف
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// تحديث ملف التعريف (اسم، إيميل)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    // التحقق من عدم استخدام الإيميل من قبل مستخدم آخر
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    updateData.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// تحديث الصورة الشخصية
exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // جلب المستخدم الحالي لحذف الصورة القديمة
    const currentUser = await User.findById(userId);
    if (currentUser && currentUser.profilePicture) {
      const oldImagePath = path.join(__dirname, '../uploads', path.basename(currentUser.profilePicture));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // تحديث مسار الصورة الجديدة
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        profilePicture: req.file.filepath,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      profilePicture: user.profilePicture,
      message: 'Profile picture updated successfully' 
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Error updating profile picture' });
  }
};

// حذف الصورة الشخصية
exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user && user.profilePicture) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(user.profilePicture));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await User.findByIdAndUpdate(userId, { profilePicture: null });

    res.json({ success: true, message: 'Profile picture removed successfully' });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ message: 'Error deleting profile picture' });
  }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    const { doHashValidation, doHash } = require('../utils/hashing');

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // التحقق من كلمة المرور الحالية
    const isMatch = await doHashValidation(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await doHash(newPassword, 12);
    user.password = hashedPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};