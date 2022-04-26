// VALIDATION
const _ = require('lodash');
const Joi = require('joi');

// Insert comment Validation
const insertCommentValidation = (data) => {
	const schema = Joi.object({
		taskId: Joi.number().required(),
		contentComment: Joi.string().required()
	});
	return schema.validate(data);
};

// Update comment Validation
const updateCommentValidation = (data) => {
	const schema = Joi.object({
		id: Joi.number().required(),
		contentComment: Joi.string().required()
	});
	return schema.validate(data);
};

module.exports = {
	insertCommentValidation,
	updateCommentValidation
};
