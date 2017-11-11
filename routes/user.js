//Third Pary Modules
const express = require('express');
const {ObjectID} = require('mongodb').ObjectID;
const _ = require('lodash');

//Init Express Router
const router = express.Router();

//Local Modules
const {User} = require('./../models/user');
const db = require('./../config/db');

//POST => Create User
router.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);

	const newUser = new User(body);

	newUser.save().then((obj) => {
		return res.send({obj});
	}).catch((e) => {
		return res.status(400).send(e);
	});
});

//Export modules
module.exports = router;