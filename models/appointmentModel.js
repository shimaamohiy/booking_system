const mongoose = require('mongoose');
const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled'],
    default: 'booked',
  },
  notes: String,
  totalPrice: Number,
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
