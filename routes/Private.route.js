var router = require('express').Router();
var privateController = require('../controllers/Private.Controller');
var { verifyAccessToken } = require('../helpers/jwt_helpers');


router.get('/', verifyAccessToken, privateController.private);

module.exports = router;