// VALIDATION
const _ = require('lodash');
const Joi = require('joi');

// Create Project Category Validation
const createValidation = data => {
    const schema = Joi.object({
        priority: Joi.string().required(),
    })
    return schema.validate(data);
}

module.exports = {
    createValidation
}