const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String, 
        required: true, 
        trim: true,
    },
    email:{
        type: String,
        required: [true,'Email is required'],
        trim: true,
        unique: [true,'Email must be unique'],
        minlength: [5,'Email must have 5 characters'],
        lowercase: true,
    },
    password:{
        type: String,
        required: [true,'Password must be provided'],
        trim: true,
        select:false,
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'professional'],
        default: 'user'
    },
    // ✅ أضف هذا الحقل الجديد
    profilePicture: {
        type: String,
        default: null
    },
    verified:{
        type:Boolean,
        default:false,
    },
    verificationCode:{
        type: String,
        select:false,
    },
    verificationCodeValidation:{
        type: Number,
        select:false,
    },
    forgotPasswordCode:{
        type: String,
        select:false,
    },
    forgotPasswordCodeValidation:{
        type: Number,
        select:false,
    },
},{
    timestamps: true  // ده هيدير createdAt و updatedAt تلقائياً
});

module.exports = mongoose.model("User", userSchema);