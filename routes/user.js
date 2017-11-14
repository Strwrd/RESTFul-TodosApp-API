//Third Pary Modules
const express = require('express');
const {ObjectID} = require('mongodb').ObjectID;
const _ = require('lodash');
const bcryptjs = require('bcryptjs');

//Init Express Router
const router = express.Router();

//Local Modules
const {User} = require('./../models/user');
const db = require('./../config/db');
const {authenticate} = require('./../middleware/authenticate');

//POST => Create User
router.post('/users', (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);

	const newUser = new User(body);

	newUser.save().then(() => {
		return newUser.generateAuthToken();
	}).then((token) => {
		return res.header('x-auth', token).send(newUser);
	}).catch((e) => {
		return res.status(400).send(e);
	});
});

//GET => Get Current Now
router.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

//POST => Login
router.post('/users/login', (req, res) => {
	const {email, password} = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(email, password).then((obj) => {
		return obj.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(obj);
		});
	}).catch((e) => {
		res.status(400).send();
	});
});

//DELETE => Logout
router.delete('/users/me/token',authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send()
	}).catch((e) => {
		res.status(400).send()
	})
});

//Export modules
module.exports = router;