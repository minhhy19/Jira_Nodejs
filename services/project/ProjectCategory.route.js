var router = require('express').Router();
var projectCategoryController = require('./controllers/ProjectCategory.Controller');
var { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/', projectCategoryController.getAllCategory);
router.post('/createProjectCategory', projectCategoryController.createProjectCategory);

module.exports = router;