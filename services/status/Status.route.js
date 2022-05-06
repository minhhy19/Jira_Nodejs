const router = require('express').Router();
const statusController = require('./controllers/Status.Controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/getAll', statusController.getAll);
// router.post('/create', verifyAccessToken, statusController.create);

module.exports = router;
