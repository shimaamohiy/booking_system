const mongoose = require('mongoose');
const feedbackSchema = mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: String
  }, { timestamps: true });
  
  module.exports = mongoose.model("Feedback", feedbackSchema);
  