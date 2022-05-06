// VALIDATION
const _ = require('lodash');
const Joi = require('joi');

const options = {
	abortEarly: false, // include all errors
	allowUnknown: true, // ignore unknown props
	stripUnknown: true // remove unknown props
};

// Insert comment Validation
const insertCommentValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		contentComment: Joi.string().required()
	});
	return schema.validate(data, options);
};

// Update comment Validation
const updateCommentValidation = (data) => {
	const schema = Joi.object({
		id: Joi.number().required(),
		contentComment: Joi.string().required()
	});
	return schema.validate(data, options);
};

module.exports = {
	insertCommentValidation,
	updateCommentValidation
};
