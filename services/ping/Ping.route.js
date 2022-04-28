const router = require('express').Router();

router.get('/', async (req, res) => {
	console.log('ping every 10 minute');
	return res.send('ping every 10 minute');
});

module.exports = router;
