var router = require('express').Router();
var projectController = require('./controllers/Project.Controller');
var { verifyAccessToken } = require('../../helpers/jwt_helpers');


router.post('/createProjectAuthorize', verifyAccessToken, projectController.createProjectAuthorize);
// router.post('/createProjectCategory', projectController.createProjectCategory);

module.exports = router;