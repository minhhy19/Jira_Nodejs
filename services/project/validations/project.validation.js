// VALIDATION
const _ = require('lodash');
const Joi = require('joi');

const options = {
	abortEarly: false, // include all errors
	allowUnknown: true, // ignore unknown props
	stripUnknown: true // remove unknown props
};

// Create Validation
const createValidation = (data) => {
	const schema = Joi.object({
		projectName: Joi.string().required(),
		description: Joi.string().required(),
		categoryId: Joi.number().required()
	});
	return schema.validate(data, options);
};

// Edit Validation
const editValidation = (data) => {
	const schema = Joi.object({
		projectName: Joi.string(),
		description: Joi.string(),
		creator: Joi.number(),
		categoryId: Joi.number()
	});
	return schema.validate(data, options);
};

const assignUserProjectValidation = (data) => {
	const schema = Joi.object({
		projectId: Joi.number().required(),
		userId: Joi.number().required()
	});
	return schema.validate(data, options);
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
		priorityId: Joi.number().required()
	});
	return schema.validate(data, options);
};

// Update task Validation
const updateTaskValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		listUserAsign: Joi.array().required(),
		taskName: Joi.string().required(),
		description: Joi.string().required(),
		statusId: Joi.number().required(),
		originalEstimate: Joi.number().required(),
		timeTrackingSpent: Joi.number().required(),
		timeTrackingRemaining: Joi.number().required(),
		projectId: Joi.number().required(),
		typeId: Joi.number().required(),
		priorityId: Joi.number().required()
	});
	return schema.validate(data, options);
};

const assignUserTaskValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		userId: Joi.number().required()
	});
	return schema.validate(data, options);
};

const removeUserTaskValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		userId: Joi.number().required()
	});
	return schema.validate(data, options);
};

// Update status Validation
const updateStatusValidation = (data) => {
	const schema = Joi.object({
		projectId: Joi.number(),
		taskId: Joi.number().required(),
		statusId: Joi.number().required()
	});
	return schema.validate(data, options);
};

// Update priority Validation
const updatePriorityValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		priorityId: Joi.number().required()
	});
	return schema.validate(data, options);
};

// Update description Validation
const updateDescriptionValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		description: Joi.string().required()
	});
	return schema.validate(data, options);
};

// Update time tracking Validation
const updateTimeTrackingValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		timeTrackingSpent: Joi.number().required(),
		timeTrackingRemaining: Joi.number().required()
	});
	return schema.validate(data, options);
};

// Update Estimate Validation
const updateEstimateValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		originalEstimate: Joi.number().required()
	});
	return schema.validate(data, options);
};

module.exports = {
	createValidation,
	editValidation,
	createTaskValidation,
	assignUserProjectValidation,
	updateTaskValidation,
	assignUserTaskValidation,
	removeUserTaskValidation,
	updateStatusValidation,
	updatePriorityValidation,
	updateDescriptionValidation,
	updateTimeTrackingValidation,
	updateEstimateValidation
};
