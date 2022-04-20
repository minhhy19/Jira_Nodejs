// VALIDATION
const _ = require('lodash');
const Joi = require('joi');
const GeneralConstant = require('../constants/general.constant');

// Create Validation
const createValidation = (data) => {
	const schema = Joi.object({
		projectName: Joi.string().required(),
		description: Joi.string().required(),
		categoryId: Joi.number().required()
	});
	return schema.validate(data);
};

// Edit Validation
const editValidation = (data) => {
	const schema = Joi.object({
		projectName: Joi.string(),
		description: Joi.string(),
		creator: Joi.number(),
		categoryId: Joi.number()
	});
	return schema.validate(data);
};

const assignUserProjectValidation = (data) => {
	const schema = Joi.object({
		projectId: Joi.number().required(),
		userId: Joi.number().required()
	});
	return schema.validate(data);
};

// Create task Validation
const createTaskValidation = (data) => {
	const schema = Joi.object({
		listUserAsign: Joi.array().required(),
		taskName: Joi.string().required(),
		description: Joi.string().required(),
		statusId: Joi.number().required(),
		originalEstimate: Joi.number().required(),
		timeTrackingSpent: Joi.number().required(),
		timeTrackingRemaining: Joi.number().required(),
		projectId: Joi.number().required(),
		typeId: Joi.number().required(),
		priorityId: Joi.number().required(),
	});
	return schema.validate(data);
};

module.exports = {
	createValidation,
	editValidation,
	createTaskValidation,
	assignUserProjectValidation
};
