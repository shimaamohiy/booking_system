const Feedback = require('../models/feedbackModel');
const Professional = require('../models/professionalModel');
const Appointment = require('../models/appointmentModel');
const { feedbackSchema } = require('../middlewares/validator');

exports.createFeedback = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { professionalId, rating, comment } = req.body;

    // Validate request
    const { error } = feedbackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Only allow users to leave feedback
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only users can leave feedback' });
    }

    // Ensure the professional exists
    const professional = await Professional.findOne({ userId: professionalId });
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    // Ensure user has at least one completed appointment with this professional
    const completedAppointment = await Appointment.findOne({
      userId,
      professionalId,
      status: 'completed',
    });

    if (!completedAppointment) {
      return res.status(403).json({
        success: false,
        message: 'You can only review professionals after a completed appointment',
      });
    }

    // Create the feedback
    const newFeedback = new Feedback({
      userId,
      professionalId,
      rating,
      comment,
    });

    await newFeedback.save();

    // Recalculate average rating for the professional
    const stats = await Feedback.aggregate([
      { $match: { professionalId: professional.userId } }, // Match by professional ID
      {
        $group: {
          _id: '$professionalId',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      professional.rating = Math.round(stats[0].avgRating * 10) / 10; // Round to 1 decimal place
      professional.reviewCount = stats[0].numReviews;
    } else {
      professional.rating = rating;
      professional.reviewCount = 1;
    }

    await professional.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: newFeedback,
    });
  } catch (err) {
    console.error('Error creating feedback:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    const { professionalId } = req.query;
    let filter = {};

    // If professionalId is provided in query, show feedback for that specific professional
    if (professionalId) {
      filter.professionalId = professionalId;
    } else {
      // Role-based logic
      if (req.user.role === 'user') {
        filter.userId = req.user.userId; // User sees their own feedback
      } else if (req.user.role === 'professional') {
        filter.professionalId = req.user.userId; // Professional sees feedback left for them
      }
      // Admin sees all feedbacks (filter remains empty)
    }

    const feedbacks = await Feedback.find(filter)
      .populate('userId', 'name')
      .populate('professionalId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: feedbacks.length, feedbacks });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
