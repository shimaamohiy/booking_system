// const Service = require('../models/ServiceModel');

// exports.createService = async (req, res) => {
//   try {
//     const { role, userId } = req.user;

//     if (role !== 'professional' && role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized to create services' });
//     }

//     const { name, description, price, discount, professionalId } = req.body;
//     const professional = await User.findById(professionalId);
//     if (!professional || professional.role !== 'professional') {
//       return res.status(400).json({ message: 'Invalid professional ID' });
//     }
//     const newService = new Service({
//       name,
//       description,
//       price,
//       discount,
//       professionalId: professional._id,
//     });

//     const result = await newService.save();
//     res.status(201).json({ success: true, service: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating service' });
//   }
// };

// exports.getAllServices = async (req, res) => {
//     try {
//         const services = await Service.find({}).populate('professionalId', 'name specialty');

//       if (!services || services.length === 0) {
//         return res.status(404).json({ 
//           success: false,
//           message: 'No Services'
//         });
//       }
  
//       res.json({ success: true, count: services.length, services });
  
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching service' });
//     }
//   };

// exports.getServiceById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const service = await Service.findById(id).populate('professionalId', 'name specialty');
//     if (!service) return res.status(404).json({ message: 'Service not found' });

//     res.json({ success: true, service });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching service' });
//   }
// };

// exports.updateService = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role, userId } = req.user;

//     const service = await Service.findById(id);
//     if (!service) return res.status(404).json({ message: 'Service not found' });

//     if (role !== 'admin' && service.professionalId.toString() !== userId) {
//       return res.status(403).json({ message: 'Not authorized to update this service' });
//     }

//     const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
//     res.json({ success: true, service: updated });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating service' });
//   }
// };

// exports.deleteService = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role, userId } = req.user;

//     const service = await Service.findById(id);
//     if (!service) return res.status(404).json({ message: 'Service not found' });

//     if (role !== 'admin' && service.professionalId.toString() !== userId) {
//       return res.status(403).json({ message: 'Not authorized to delete this service' });
//     }

//     await service.remove();
//     res.json({ success: true, message: 'Service deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting service' });
//   }
// };
const Service = require('../models/serviceModel');
const User = require('../models/usersModel');

// إنشاء خدمة
exports.createService = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role !== 'professional' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create services' });
    }

    const { name, description, price, discount, professionalId } = req.body;
    let finalProfessionalId = userId;

    if (role === 'admin') {
      if (!professionalId) {
        return res.status(400).json({ message: 'Professional ID is required for admin' });
      }
      finalProfessionalId = professionalId;
    }

    const newService = new Service({
      name,
      description,
      price,
      discount,
      professionalId: finalProfessionalId
    });

    const result = await newService.save();
    
    // Populate professionalId to send full object back, required for frontend 'canEditOrDelete' check
    const populatedResult = await Service.findById(result._id).populate('professionalId', 'name');
    res.status(201).json({ success: true, service: populatedResult });
  } catch (error) {
    res.status(500).json({ message: 'Error creating service' });
  }
};

// عرض جميع الخدمات
exports.getAllServices = async (req, res) => {
  try {
    const { role, userId } = req.user;
    let services;

    console.log('User role:', role); // سجل دور المستخدم
    console.log('User ID:', userId); // سجل الـ userId

    if (role === 'professional') {
      // المحترف يجب أن يرى فقط الخدمات التي هو مشترك فيها
      services = await Service.find({ professionalId: userId }).populate('professionalId', 'name');
    } else {
      // كل الآخرين يرون جميع الخدمات
      services = await Service.find({}).populate('professionalId', 'name');
    }

    console.log('Fetched services:', services); // سجل الخدمات المسترجعة
    res.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error); // سجل الأخطاء
    res.status(500).json({ message: 'Error fetching services' });
  }
};
// تعديل خدمة
exports.updateService = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params; // خدمة عن طريق الـ id
    const { name, description, price, discount } = req.body;

    // التحقق من وجود الخدمة
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // التأكد من أن المحترف يمكنه تعديل الخدمة التي هو مشترك فيها فقط، أو الإداري يمكنه تعديل أي خدمة
    if (role === 'admin') {
      // الإداري يمكنه تعديل أي خدمة
      service.name = name || service.name;
      service.description = description || service.description;
      service.price = price || service.price;
      service.discount = discount || service.discount;
    } else if (role === 'professional' && service.professionalId.toString() === userId) {
      // المحترف يمكنه تعديل الخدمة التي هو مشترك فيها فقط
      service.name = name || service.name;
      service.description = description || service.description;
      service.price = price || service.price;
      service.discount = discount || service.discount;
    } else {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await service.save();
    res.json({ success: true, service: updatedService });
  } catch (error) {
    res.status(500).json({ message: 'Error updating service' });
  }
};
// حذف خدمة
exports.deleteService = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params; // خدمة عن طريق الـ id

    // التحقق من وجود الخدمة
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // التأكد من أن المحترف يمكنه حذف الخدمة التي هو مشترك فيها فقط، أو الإداري يمكنه حذف أي خدمة
    if (role === 'admin') {
      // الإداري يمكنه حذف أي خدمة
      await Service.deleteOne({ _id: id });
    } else if (role === 'professional' && service.professionalId.toString() === userId) {
      // المحترف يمكنه حذف الخدمة التي هو مشترك فيها فقط
      await Service.deleteOne({ _id: id });
    } else {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
};