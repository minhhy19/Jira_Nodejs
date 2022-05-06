// VALIDATION
const _ = require('lodash');
const Joi = require('joi');

const options = {
	abortEarly: false, // include all errors
	allowUnknown: true, // ignore unknown props
	stripUnknown: true // remove unknown props
};

// Create Project Category Validation
const createValidation = (data) => {
	const schema = Joi.object({
		priority: Joi.string().required()
	});
	return schema.validate(data, options);
};

module.exports = {
	createValidation
};
