const router = require('express').Router();
const priorityController = require('./controllers/Priority.Controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/getAll', priorityController.getAll);
// router.post('/create', verifyAccessToken, priorityController.create);

module.exports = router;
