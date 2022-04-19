var router = require('express').Router();
var priorityController = require('./controllers/Priority.Controller');
var { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/getAll', priorityController.getAll);
// router.post('/create', priorityController.create);

module.exports = router;