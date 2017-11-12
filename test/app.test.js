//Third Party Module
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

//Local Module
const {app} = require('./../app');
const {Todo} = require('./../models/todo');
const {seedTodos,seedUsers, dummyTodo,dummyUser} = require('./seed/seed');

// Seeder
beforeEach(seedUsers);
beforeEach(seedTodos);

//Test Case
describe('GET /todos', () => {
	it('Should get all todo (expect : 2)', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.obj.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('Should return first todo by ID', (done) => {
		request(app)
			.get(`/todos/${dummyTodo[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.obj._id).toBe(dummyTodo[0]._id.toHexString());
				expect(res.body.obj.text).toBe(dummyTodo[0].text);
				expect(_.isObject(res.body.obj)).toBe(true);
			}).end(done);
	});

	it('Should not return if Object ID not valid', (done) => {
		request(app)
			.get('/todos/qwerty')
			.expect(400)
			.expect((res) => {
				expect(res.body).toEqual({})
			})
			.end(done);
	});

	it('Should not return if Object ID not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /todos',() =>{
	it('Should create new todo', (done) => {
		const text = "Third dummy todo";

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.obj.text).toBe(text);
			})
			.end(done);
	});

	it('Should not create todo with invalid data body', (done) => {
		const text = '';

		request(app)
			.post('/todos')
			.send({text})
			.expect(400)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('PATCH /todos/:id', () => {
	it('Should update todo', (done) => {
		const update = {
			text: "Updated first todo",
			completed: true
		};

		request(app)
			.patch(`/todos/${dummyTodo[0]._id.toHexString()}`)
			.send(update)
			.expect(200)
			.expect((res) => {
				expect(res.body.obj.completedAt).toBeA('number');
				expect(res.body.obj.text).toBe(update.text);
				expect(res.body.obj.completed).toBe(update.completed);
			})
			.end(done);
	});

	it('Should null/undefined completedAt when todo not completed', (done) => {
		const update = {
			completed : false
		};

		request(app)
			.patch(`/todos/${dummyTodo[0]._id.toHexString()}`)
			.send(update)
			.expect(200)
			.expect((res) => {
				expect(res.body.obj.completedAt).toBe(null);
				expect(res.body.obj.completed).toBe(false);
			})
			.end(done);
	});
});

describe('DELETE /todos/:id', () => {
	it('Should delete todo by ID', (done) => {
		request(app)
			.delete(`/todos/${dummyTodo[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.obj._id).toBe(dummyTodo[0]._id.toHexString());
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.findById(dummyTodo[0]._id).then((obj) => {
					expect(obj).toNotExist();
					done()
				}).catch((e) => {
					done(e);
				})
			})
	});

	it('Should not delete todo if ObjectID not valid', (done) => {
		request(app)
			.delete('/todos/123abc')
			.expect(400)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});

	it('Should not delete todo if ObjectID not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID()}`)
			.expect(404)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});