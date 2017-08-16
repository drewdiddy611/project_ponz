var express = require('express');
var router = express.Router();

const { User } = require('../models');

/* GET users listing. */
router.get('/signup', async (req, res) => {
	let options = {};
	if (req.query._referrerCode) {
		options._referrerCode = req.query._referrerCode;
	}
	return res.render('signup', options);
});

router.post('/signup', async (req, res, next) => {
	// Extract form data.
	const formData = {
		username: req.body.username,
		password: req.body.password
	};

	if (req.body._referrerCode) {
		// Get the referring user by the link.
		formData.parent = await User.getReferrer(req.body._referrerCode);
	}

	let user = await User.create(formData);
	if (!user) {
		return next(new Error('Unable to create user'));
	}

	if (req.body._referrerCode) {
		formData.parent.addPonvert(user);
	}

	// We have a user here.
	try {
		await req.login(user, () => {});
		res.redirect('/');
	} catch (e) {
		next(e);
	}
});

module.exports = router;
