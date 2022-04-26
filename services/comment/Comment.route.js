const router = require('express').Router();
const commentController = require('./controllers/Comment.Controller');
const { verifyAccessToken } = require('../../helpers/jwt_helpers');

router.get('/getAll', commentController.getAll);
router.post('/insertComment', verifyAccessToken, commentController.insertComment);
router.put('/updateComment', verifyAccessToken, commentController.updateComment);
router.delete('/deleteComment', verifyAccessToken, commentController.deleteComment);

module.exports = router;
