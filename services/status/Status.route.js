const router = require('express').Router();
const statusController = require('./controllers/Status.Controller');

router.get('/getAll', statusController.getAll);
router.post('/create', statusController.create);

module.exports = router;
