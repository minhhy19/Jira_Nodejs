const router = require('express').Router();
const taskTypeController = require('./controllers/TaskType.controller');

router.get('/getAll', taskTypeController.getAll);
// router.post('/create', taskTypeController.create);

module.exports = router;
