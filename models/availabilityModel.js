const mongoose = require('mongoose');
const availabilitySchema = mongoose.Schema(
  {
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    availableSlots: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
