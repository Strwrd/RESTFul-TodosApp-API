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
router.post('/todos/', authenticate, async (req, res) => {
	const newTodo = new Todo({
		text: req.body.text,
		creator: req.user._id
	});

	try{
		const todo = await newTodo.save();
		return res.send({todo});
	}catch (e){
		return res.status(400).send();
	}
});

//GET => Getting All Todo
router.get('/todos', authenticate, async (req, res) => {
	try{
		const todos = await Todo.find({creator: req.user._id});
		return res.send({todos});
	}catch (e){
		return res.status(400).send();
	}
});

//GET => Getting Todo by ID
router.get('/todos/:id', authenticate, async (req, res) => {

	if (!ObjectID.isValid(req.params.id)) {
		return res.status(400).send();
	}

	try{
		const todo = await Todo.findOne({
			_id: req.params.id,
			creator: req.user._id
		});
		if(!todo){
			return res.status(404).send();
		}
		return res.send({todo});
	}catch (e){
		return res.status(400).send();
	}
});

//PATCH => Update Todo by ID
router.patch('/todos/:id', authenticate, async (req, res) => {

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

	try{
		const todo = await Todo.findOneAndUpdate({
			_id: req.params.id,
			creator: req.user._id
		}, {$set: body}, {new: true});
		if(!todo){
			return res.status(404).send();
		}
		return res.send({todo});
	}catch (e){
		return res.status(400).send(e);
	}
});

//DELETE => Delete Todo byID
router.delete('/todos/:id', authenticate, async (req, res) => {

	if (!ObjectID.isValid(req.params.id)) {
		return res.status(400).send();
	}

	try{
		const todo = await Todo.findOneAndRemove({_id: req.params.id, creator: req.user._id});
		if(!todo){
			return res.status(404).send();
		}
		return res.send({todo});
	}catch (e){
		res.status(400).send();
	}
});

//Export modules
module.exports = router;