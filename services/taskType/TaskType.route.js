const router = require('express').Router();
const taskTypeController = require('./controllers/TaskType.controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/getAll', taskTypeController.getAll);
// router.post('/create', verifyAccessToken, taskTypeController.create);

module.exports = router;
