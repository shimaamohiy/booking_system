const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { upload, processProfileImage } = require('../middlewares/upload');
const {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
  changePassword
} = require('../controllers/profileController');

// جميع routes تحتاج توكن صالح
router.use(verifyToken);

// GET /api/profile - الحصول على الملف الشخصي
router.get('/', getProfile);

// PUT /api/profile - تحديث الملف الشخصي (اسم، إيميل)
router.put('/', updateProfile);

// POST /api/profile/picture - رفع صورة شخصية
router.post('/picture', upload.single('profilePicture'), processProfileImage, updateProfilePicture);

// DELETE /api/profile/picture - حذف الصورة الشخصية
router.delete('/picture', deleteProfilePicture);

// PUT /api/profile/password - تغيير كلمة المرور
router.put('/password', changePassword);

module.exports = router;