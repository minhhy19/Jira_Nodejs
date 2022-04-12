// VALIDATION
const Joi = require('joi');

// Register Validation
const registerValidation = data => {
    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(30)
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),

        // username: Joi.string()
        //     .alphanum()
        //     .min(3)
        //     .max(30)
        //     .required(),

        passWord: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        
        phoneNumber: Joi.number(),

    })
    return schema.validate(data);
}

// Login Validation
const loginValidation = data => {
    const schema = Joi.object({
        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    })
    return schema.validate(data);
}

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;