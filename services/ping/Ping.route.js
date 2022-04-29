const router = require('express').Router();
const logger = require('../../loggerService');

router.get('/', async (req, res) => res.send('ping every 10 minute'));

module.exports = router;
