// VALIDATION
const _ = require('lodash');
const Joi = require('joi');

// Create Project Category Validation
const createProjectCategoryValidation = data => {
    const schema = Joi.object({
        projectCategoryName: Joi.string().required(),
    })
    return schema.validate(data);
}

module.exports = {
    createProjectCategoryValidation
}