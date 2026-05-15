require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require('path');

const signRouter = require("./routers/signRouter");
const appointmentRouter = require('./routers/appointmentRouter');
const serviceRouter = require('./routers/serviceRouter');
const profileRouter = require('./routers/profileRouter');
const userRouter = require('./routers/userRouter'); // ✅ أضف هذا لو هتستخدم professionals

const app = express();

// 🔐 Security middleware
app.use(helmet());

// 🍪 Cookies
app.use(cookieParser());

// 📦 Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🌐 CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 🔌 MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err);
  });

// 🛣️ Routes
app.use("/api/sign", signRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/services", serviceRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", userRouter); // ✅ أضف هذا لو هتستخدم professionals

// 🏠 Test route
app.get('/', (req, res) => {
  res.json({ message: 'Booking System API is running!' });
});

// 🚀 Start server
const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
  });
}

module.exports = app;