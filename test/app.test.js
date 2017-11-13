//Third Party Module
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

//Local Module
const {app} = require('./../app');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {seedTodos, seedUsers, dummyTodo, dummyUser} = require('./seed/seed');

// Seeder
beforeEach(seedUsers);
beforeEach(seedTodos);

//Todo test case block
describe('Todo Test Cases', () => {
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

	describe('POST /todos', () => {
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
				completed: false
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
});

//User test case block
describe('User Test Cases', () => {
	describe('GET /users/me', () => {
		it('Should return user if authenticated', (done) => {
			request(app)
				.get('/users/me')
				.set('x-auth', dummyUser[0].tokens[0].token)
				.expect(200)
				.expect((res) => {
					expect(res.body.email).toBe(dummyUser[0].email);
					expect(res.body._id).toBe(dummyUser[0]._id.toHexString());
				})
				.end(done)
		});

		it('Should return 401 if user not authenticated', (done) => {
			request(app)
				.get('/users/me')
				.set('x-auth', 'asd')
				.expect(401)
				.expect((res) => {
					expect(res.body).toEqual({})
				})
				.end(done);
		});
	});

	describe('POST /users', () => {
		it('Should create a new user', (done) => {

			const email = 'userThree@examples.com';
			const password = 'secretThree';

			request(app)
				.post('/users')
				.send({email, password})
				.expect(200)
				.expect((res) => {
					expect(res.body.email).toBe(email);
					expect(res.body._id).toExist();
					expect(res.header['x-auth']).toExist();
				})
				.end((err) => {
					if (err) {
						return done(err);
					}

					User.findOne({email}).then((obj) => {
						if (!obj) {
							return done(new Error());
						}

						expect(obj).toExist();
						expect(obj.password).toNotBe(password);
						done();
					})
				});
		});

		it('Should not create user if email is not unique', (done) => {

			const email = 'userOne@examples.com';
			const pass = 'secretOne';

			request(app)
				.post('/users')
				.send({email, pass})
				.expect(400)
				.end(done);
		});

		it('Should return validation error if request invalid', (done) => {
			const email = '';
			const pass = 'adfgfx';

			request(app)
				.post('/users')
				.send({email, pass})
				.expect(400)
				.end(done);
		});
	});
});
