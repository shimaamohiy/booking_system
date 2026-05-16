const mongoose = require('mongoose');
const professionalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // name: {
    //   type: String,
    //   required: true ,
    
    specialty: {
      type: String,
      enum: ['doctor', 'Dermatologist', 'Ophthalmologist', 'Dentist'],
      default: 'doctor',
    },
    bio: String,
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Professional', professionalSchema);
