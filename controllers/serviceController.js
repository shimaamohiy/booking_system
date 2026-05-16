// const Service = require('../models/ServiceModel');

// exports.createService = async (req, res) => {
//   try {
//     const { role, userId } = req.user;

//     if (role !== 'professional' && role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized to create services' });


//     const { name, description, price, discount, professionalId } = req.body;
//     const professional = await User.findById(professionalId);
//     if (!professional || professional.role !== 'professional') {
//       return res.status(400).json({ message: 'Invalid professional ID' });

//     const newService = new Service({
//       name,
//       description,
//       price,
//       discount,
//       professionalId: professional._id,


//     const result = await newService.save();
//     res.status(201).json({ success: true, service: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error creating service' });



// exports.getAllServices = async (req, res) => {
//     try {
//         const services = await Service.find({}).populate('professionalId', 'name specialty');

//       if (!services || services.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'No Services'



//       res.json({ success: true, count: services.length, services });

//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching service' });



// exports.getServiceById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const service = await Service.findById(id).populate('professionalId', 'name specialty');
//     if (!service) return res.status(404).json({ message: 'Service not found' });

//     res.json({ success: true, service });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching service' });



// exports.updateService = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role, userId } = req.user;

//     const service = await Service.findById(id);
//     if (!service) return res.status(404).json({ message: 'Service not found' });

//     if (role !== 'admin' && service.professionalId.toString() !== userId) {
//       return res.status(403).json({ message: 'Not authorized to update this service' });


//     const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
//     res.json({ success: true, service: updated });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating service' });



// exports.deleteService = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role, userId } = req.user;

//     const service = await Service.findById(id);
//     if (!service) return res.status(404).json({ message: 'Service not found' });

//     if (role !== 'admin' && service.professionalId.toString() !== userId) {
//       return res.status(403).json({ message: 'Not authorized to delete this service' });


//     await service.remove();
//     res.json({ success: true, message: 'Service deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting service' });


const Service = require('../models/serviceModel');
const User = require('../models/usersModel');


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
      professionalId: finalProfessionalId,
    });

    const result = await newService.save();

    // Populate professionalId to send full object back, required for frontend 'canEditOrDelete' check
    const populatedResult = await Service.findById(result._id).populate('professionalId', 'name');
    res.status(201).json({ success: true, service: populatedResult });
  } catch (error) {
    res.status(500).json({ message: 'Error creating service' });
  }
};


exports.getAllServices = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { search, minPrice, maxPrice, sort } = req.query;

    let filter = {};

    console.log('User role:', role); 
    console.log('User ID:', userId); 

    if (role === 'professional') {
      
      filter.professionalId = userId;
    }

    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };

    const services = await Service.find(filter)
      .populate('professionalId', 'name rating reviewCount')
      .sort(sortOptions);

    console.log('Fetched services:', services); 
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Error fetching services:', error); 
    res.status(500).json({ message: 'Error fetching services' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params; 
    const { name, description, price, discount } = req.body;

    
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    
    if (role === 'admin') {
      
      service.name = name || service.name;
      service.description = description || service.description;
      service.price = price || service.price;
      service.discount = discount || service.discount;
    } else if (role === 'professional' && service.professionalId.toString() === userId) {
      
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

exports.deleteService = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params; 

    
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    
    if (role === 'admin') {
      
      await Service.deleteOne({ _id: id });
    } else if (role === 'professional' && service.professionalId.toString() === userId) {
      
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
