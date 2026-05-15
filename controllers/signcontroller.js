const {signupSchema,loginSchema} = require('../middlewares/validator');
const User = require('../models/usersModel');
const Professional = require('../models/professionalModel');

const { doHash, doHashValidation } = require('../utils/hashing');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { name, email, password, role ,specialty  } = req.body;
    try {
        const {error,value} = signupSchema.validate({name, email, password, role});
        
        if(error){
            return res.status(400).json({success:false, message: error.details[0].message})
        }
        const existinguser = await User.findOne({email}) ;
        if(existinguser){
            return res.status(401).json({success:false, message: "User Already exist!"})
        }
        const hasedPaswword = await doHash(password,12);
        const newUser = new User({
            email,
            password:hasedPaswword,
            name,
            role,
        })
         if (role === 'professional') {
            await Professional.create({
            userId: newUser._id,
            specialty,
        });
        }
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({success:true, message: "Your Account has been created Successfully ", result,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const {error,value} = loginSchema.validate({email, password});
        
        if(error){
            return res.status(400).json({success:false, message: error.details[0].message})
        }
        const existinguser = await User.findOne({email}).select('+password') ;
        if(!existinguser){
            return res.status(401).json({success:false, message: "User does not exist!"})
        }
        const isMatch  =await doHashValidation(password, existinguser.password);
        if(!isMatch ){
            return res.status(401).json({success:false, message: "Invalid Password!"})
        }
        const token = jwt.sign({ userId: existinguser._id, role: existinguser.role, name:existinguser.name }, process.env.JWT_SECRET, {
            expiresIn: '8h'
          });
      
          res
          .cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000), 
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',   
            sameSite: 'strict'
          })
          .json({
            success: true,
            token,
            message: 'Logged in successfully',
             user: {
                _id: existinguser._id,
                name: existinguser.name,
                email: existinguser.email,
                role: existinguser.role,
               
                }
          });
    } catch (error) {
        console.log(error);
    }
};
exports.logout = async (req, res) => {

    res.clearCookie('Authorization').status(200).json({
        success: true,
        message: 'logout successfully',
    })
};
