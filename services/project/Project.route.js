const router = require('express').Router();
const projectController = require('./controllers/Project.Controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.post('/createProjectAuthorize', verifyAccessToken, projectController.createProjectAuthorize);
router.get('/getAllProject', verifyAccessToken, projectController.getAll);
router.get('/getProjectDetail', verifyAccessToken, projectController.getProjectDetail);
router.put('/updateProject', verifyAccessToken, projectController.updateProject);
router.delete('/deleteProject', verifyAccessToken, projectController.deleteProject);

router.post('/assignUserProject', verifyAccessToken, projectController.assignUserProject);
router.post('/removeUserFromProject', verifyAccessToken, projectController.removeUserFromProject);
// router.post('/createProjectCategory', projectController.createProjectCategory);

router.post('/assignUserTask', verifyAccessToken, projectController.assignUserTask);
router.post('/removeUserFromTask', verifyAccessToken, projectController.removeUserFromTask);

router.post('/createTask', verifyAccessToken, projectController.createTask);
router.post('/updateTask', verifyAccessToken, projectController.updateTask);
router.get('/getTaskDetail', verifyAccessToken, projectController.getTaskDetail);
router.delete('/removeTask', verifyAccessToken, projectController.removeTask);

router.put('/updateStatus', verifyAccessToken, projectController.updateStatus);
router.put('/updatePriority', verifyAccessToken, projectController.updatePriority);
router.put('/updateDescription', verifyAccessToken, projectController.updateDescription);
router.put('/updateTimeTracking', verifyAccessToken, projectController.updateTimeTracking);
router.put('/updateEstimate', verifyAccessToken, projectController.updateEstimate);

module.exports = router;
