const joi = require('joi');

exports.signupSchema = joi.object({
    name: joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must be at most 30 characters"
      }),
    email: joi.string().min(5).max(30).required().email()
    .messages({
        "string.email": "Invalid email format",
        "string.empty": "Email is required"
      }),
    password: joi.string().required().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$"))
    .messages({
        "string.pattern.base":
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
        "string.empty": "Password is required"
      }),
    role: joi.string()
    .valid('user', 'admin', 'professional')
    .required(),

});
exports.loginSchema = joi.object({
    email: joi.string().min(5).max(30).required().email()
    .messages({
        "string.email": "Email is wrong",
        "string.empty": "Email is required"
      }),
    password: joi.string().required().pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$"))
    .messages({
        "string.pattern.base":
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
        "string.empty": "Password is required"
      }),
    
});

