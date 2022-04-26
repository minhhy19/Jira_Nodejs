const router = require('express').Router();
const authController = require('./controllers/Auth.Controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.post('/signup', authController.signup);

router.post('/signin', authController.signin);

router.put('/editUser', authController.editUser);

router.delete('/deleteUser', verifyAccessToken, authController.deleteUser);

router.get('/getUserByProjectId', verifyAccessToken, authController.getUserByProjectId);

router.get('/getUser', verifyAccessToken, authController.getUser);

// router.post('/refresh-token', authController.refreshToken);

// router.delete('/logout', authController.logout);

module.exports = router;
