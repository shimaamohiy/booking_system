const Appointment = require('../models/appointmentModel');
const Service = require('../models/serviceModel');
const Availability = require('../models/availabilityModel');
const User = require('../models/usersModel');


exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    const { status } = req.query; 
    let filter = {};

    if (role === 'user') {
      filter.userId = userId;
    } else if (role === 'professional') {
      filter.professionalId = userId;
    }

    
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name price')
      .populate('professionalId', 'name')
      .sort({ date: 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};


exports.createAppointment = async (req, res) => {
  try {
    console.log('📅 Create appointment request:', req.body);
    console.log('👤 User:', req.user);

    
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can book appointments' });
    }

    
    const { professionalId, serviceId, date, timeSlot } = req.body;
    const userId = req.user.userId;

    
    if (!professionalId) {
      return res.status(400).json({ message: 'Professional ID is required' });
    }
    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    if (!timeSlot) {
      return res.status(400).json({ message: 'Time slot is required' });
    }

    
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    
    const professional = await User.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    if (professional.role !== 'professional') {
      return res.status(400).json({ message: 'Selected user is not a professional' });
    }

    
    const existingAppointment = await Appointment.findOne({
      professionalId,
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    
    const discount = service.discount || 0;
    const finalPrice = service.price - service.price * (discount / 100);

    
    const newAppointment = new Appointment({
      userId,
      professionalId,
      serviceId,
      date: new Date(date),
      timeSlot,
      totalPrice: finalPrice,
      status: 'booked',
    });

    const result = await newAppointment.save();
    console.log('✅ Appointment created:', result._id);

    res.status(201).json({
      success: true,
      appointment: result,
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    console.error('❌ Error in createAppointment:', error);
    res.status(500).json({
      message: 'Error booking appointment',
      error: error.message,
    });
  }
};


exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (userRole === 'user' && appointment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    if (userRole === 'professional' && appointment.professionalId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    
    if (date || timeSlot) {
      const newDate = date || appointment.date;
      const newTimeSlot = timeSlot || appointment.timeSlot;

      const existingAppointment = await Appointment.findOne({
        professionalId: appointment.professionalId,
        date: new Date(newDate),
        timeSlot: newTimeSlot,
        _id: { $ne: id },
        status: { $ne: 'cancelled' },
      });

      if (existingAppointment) {
        return res.status(400).json({ message: 'This time slot is already booked' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        date: date ? new Date(date) : appointment.date,
        timeSlot: timeSlot || appointment.timeSlot,
        status: req.body.status || appointment.status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
};


exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (role === 'user' && appointment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (role === 'professional' && appointment.professionalId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
};
