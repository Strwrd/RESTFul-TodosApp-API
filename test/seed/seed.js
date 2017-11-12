//Third Party Modules
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

//Local Modules
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

//Create Some Dummy Todo
const dummyTodo = [{
	_id : new ObjectID(),
	text: "First Dummy todo",
	completed: false,
	completedAt: 33
}, {
	text: "Second Dummy todo",
	completed: false,
	completedAt: null
}];

//Create Some Dummy User
const idUserOne = new ObjectID();
const idUserTwo = new ObjectID();

const dummyUser = [{
	_id : idUserOne,
	email : 'userOne@examples.com',
	password : 'secretOne',
	tokens : [{
			access : 'auth',
			token : jwt.sign({_id: idUserOne.toHexString(), access : 'auth'}, 'secret').toString()
	}]
},{
	_id : idUserTwo,
	email : 'userTwo@examples.com',
	password : 'secretTwo',
}];

const seedTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(dummyTodo);
	}).then(() => done());
};

const seedUsers = (done) => {
	User.remove({}).then(() => {
		const userOne = new User(dummyUser[0]).save();
		const userTwo = new User(dummyUser[1]).save();

		return Promise.all([userOne, userTwo]);
	}).then(() => {
		done();
	});
};

module.exports = {
	dummyTodo,
	dummyUser,
	seedTodos,
	seedUsers
};