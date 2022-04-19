var router = require('express').Router();
var statusController = require('./controllers/Status.Controller');

router.get('/getAll', statusController.getAll);
// router.post('/create', statusController.create);

module.exports = router;