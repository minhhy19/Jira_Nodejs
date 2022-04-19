var router = require('express').Router();
var projectController = require('./controllers/Project.Controller');
var { verifyAccessToken } = require('../../helpers/jwt_helpers');


router.post('/createProjectAuthorize', verifyAccessToken, projectController.createProjectAuthorize);
router.get('/getAllProject', verifyAccessToken, projectController.getAll);
router.get('/getProjectDetail', verifyAccessToken, projectController.getProjectDetail);
// router.post('/createProjectCategory', projectController.createProjectCategory);

router.post('/createTask', verifyAccessToken, projectController.createTask);

module.exports = router;