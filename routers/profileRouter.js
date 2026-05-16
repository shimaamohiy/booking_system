const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { upload, processProfileImage } = require('../middlewares/upload');
const {
  getProfile,
  updateProfile,
  updateProfilePicture,
  deleteProfilePicture,
  changePassword,
} = require('../controllers/profileController');


router.use(verifyToken);


router.get('/', getProfile);


router.put('/', updateProfile);


router.post('/picture', upload.single('profilePicture'), processProfileImage, updateProfilePicture);


router.delete('/picture', deleteProfilePicture);


router.put('/password', changePassword);

module.exports = router;
