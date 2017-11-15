//Third Pary Modules
const express = require('express');
const {ObjectID} = require('mongodb').ObjectID;
const _ = require('lodash');

//Init Express Router
const router = express.Router();

//Local Modules
const {Todo} = require('./../models/todo');
const db = require('./../config/db');
const {authenticate} = require('./../middleware/authenticate');

//POST => Create Todo
router.post('/todos/', authenticate, (req, res) => {
	const newTodo = new Todo({
		text: req.body.text,
		creator: req.user._id
	});

	newTodo.save().then((obj) => {
		return res.send({obj});
	}).catch((e) => {
		return res.status(400).send();
	});
});

//GET => Getting All Todo
router.get('/todos', authenticate, (req, res) => {
	Todo.find({
		creator: req.user._id
	}).then((obj) => {
		if (!obj) {
			return res.status(404).send();
		}
		return res.send({obj});
	}).catch((e) => {
		return res.status(400).send();
	});
});

//GET => Getting Todo by ID
router.get('/todos/:id', authenticate, (req, res) => {

	if (!ObjectID.isValid(req.params.id)) {
		return res.status(400).send();
	}

	Todo.findOne({
		_id: req.params.id,
		creator: req.user._id
	}).then((obj) => {
		if (!obj) {
			return res.status(404).send();
		}
		return res.send({obj});
	}).catch((e) => {
		return res.status(400).send();
	})
});

//PATCH => Update Todo by ID
router.patch('/todos/:id', authenticate,(req, res) => {

	if (!ObjectID.isValid(req.params.id)) {
		return res.status(400).send()
	}

	const body = _.pick(req.body, ['text', 'completed']);

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getDate();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({
		_id : req.params.id,
		creator : req.user._id
	}, {$set: body}, {new: true}).then((obj) => {
		if (!obj) {
			return res.status(404).send()
		}

		return res.send({obj});
	}).catch((e) => {
		return res.status(400).send(e);
	})
});

//DELETE => Delete Todo byID
router.delete('/todos/:id', authenticate, (req, res) => {

	if (!ObjectID.isValid(req.params.id)) {
		return res.status(400).send();
	}

	Todo.findOneAndRemove({ _id :req.params.id, creator : req.user._id}).then((obj) => {
		if (!obj) {
			return res.status(404).send();
		}

		return res.send({obj});
	}).catch((e) => {
		res.status(400).send();
	})
});

//Export modules
module.exports = router;