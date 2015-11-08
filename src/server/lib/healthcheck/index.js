'use strict';

var router = require('express').Router();

router.get('', function (req, res) {
	res.status(200).json({ status: 'ok' });
});

module.exports = router;