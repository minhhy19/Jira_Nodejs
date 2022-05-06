const router = require('express').Router();
const projectCategoryController = require('./controllers/ProjectCategory.Controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/', projectCategoryController.getAllCategory);
// router.post('/createProjectCategory', verifyAccessToken, projectCategoryController.createProjectCategory);

module.exports = router;
