// VALIDATION
const Joi = require('joi');

// Register Validation
const registerValidation = (data) => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(30).required(),

		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
			.required(),

		passWord: Joi.string()
			.pattern(/^[a-zA-Z0-9]{3,30}$/)
			.required(),

		phoneNumber: Joi.number().required()
	});
	return schema.validate(data);
};

// Login Validation
const loginValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
			.required(),

		passWord: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/).required()
	});
	return schema.validate(data);
};

// Edit User Validation
const editUserValidation = (data) => {
	const schema = Joi.object({
		id: Joi.number(),

		name: Joi.string().min(3).max(30).required(),

		email: Joi.string()
			.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
			.required(),

		passWord: Joi.string()
			.pattern(/^[a-zA-Z0-9]{3,30}$/)
			.required(),

		phoneNumber: Joi.number().required()
	});
	return schema.validate(data);
};

module.exports = {
	registerValidation,
	loginValidation,
	editUserValidation
};
