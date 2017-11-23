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
router.post('/users', async (req, res) => {
	const body = _.pick(req.body, ['email', 'password']);
	const newUser = new User(body);

	try{
		await newUser.save();
		const userToken = await newUser.generateAuthToken();
		return res.header('x-auth', userToken).send(newUser);
	}catch (e){
		return res.status(400).send(e);
	}
});

//GET => Get Current Now
router.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

//POST => Login
router.post('/users/login', async (req, res) => {
	const {email, password} = _.pick(req.body, ['email', 'password']);
	try{
		const user = await User.findByCredentials(email, password);
		const userToken = await user.generateAuthToken();
		res.header('x-auth', userToken).send(user);
	}catch (e){
		res.status(400).send();
	}
});

//DELETE => Logout
router.delete('/users/me/token',authenticate, async (req, res) => {
	try{
		await req.user.removeToken(req.token);
		res.status(200).send()
	} catch(e){
		res.status(400).send()
	}
});

//Export modules
module.exports = router;