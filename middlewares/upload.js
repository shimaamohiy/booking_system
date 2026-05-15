const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// التأكد من وجود مجلد uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// تكوين multer للتخزين المؤقت
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// معالجة الصورة (تحسين الحجم)
const processProfileImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
    const filepath = path.join(__dirname, '../uploads', filename);

    await sharp(req.file.buffer)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.filepath = `/uploads/${filename}`;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
};

module.exports = { upload, processProfileImage };