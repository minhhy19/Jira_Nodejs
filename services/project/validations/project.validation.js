// VALIDATION
const _ = require('lodash');
const Joi = require('joi');
const GeneralConstant = require('../constants/general.constant');

// Create Validation
const createValidation = data => {
    const schema = Joi.object({
        projectName: Joi.string().required(),
        description: Joi.string().required(),
        categoryId: Joi.number().required()
    })
    return schema.validate(data);
}

module.exports = {
    createValidation
}