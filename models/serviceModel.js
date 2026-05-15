const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
    name: {
     type: String, 
     required: true,
    },
    description: String,
    // duration: {
    //  type: Number, 
    //  required: true,
    // }, 
    price: {
     type: Number, 
     required: true,
    },
    discount: {
     type: Number, 
     default: 0,
    },
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  }, { timestamps: true });
  
  module.exports = mongoose.model("Service", serviceSchema);
  