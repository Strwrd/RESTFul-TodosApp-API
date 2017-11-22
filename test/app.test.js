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
		it('Should get all todo of userOne by passing token', (done) => {
			request(app)
				.get('/todos')
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(200)
				.expect((res) => {
					expect(res.body.obj.length).toBe(1);
				})
				.end(done);
		});
	});

	describe('GET /todos/:id', () => {
		it('Should return todo by ID', (done) => {
			request(app)
				.get(`/todos/${dummyTodo[0]._id.toHexString()}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(200)
				.expect((res) => {
					expect(res.body.obj._id).toBe(dummyTodo[0]._id.toHexString());
					expect(res.body.obj.text).toBe(dummyTodo[0].text);
					expect(_.isObject(res.body.obj)).toBe(true);
				}).end(done);
		});

		it('Should not return todo created by other user', (done) => {
			request(app)
				.get(`/todos/${dummyTodo[1]._id.toHexString()}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(404)
				.expect((res) => {
					expect(res.body).toEqual({});
				}).end(done);
		});



		it('Should not return if Object ID not valid', (done) => {
			request(app)
				.get('/todos/qwerty')
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(400)
				.expect((res) => {
					expect(res.body).toEqual({})
				})
				.end(done);
		});

		it('Should not return if Object ID not found', (done) => {
			request(app)
				.get(`/todos/${new ObjectID().toHexString()}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
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
				.set('x-auth',dummyUser[0].tokens[0].token)
				.send({text})
				.expect(200)
				.expect((res) => {
					expect(res.body.obj.text).toBe(text);
				})
				.end((err,res) => {
					if(err){
						return done(err);
					}

					Todo.find({text}).then((obj) => {
						expect(obj[0].text).toBe(text);
						expect(obj.length).toBe(1);
						done();
					}).catch((e) => {
						return done(e);
					});
				});
		});

		it('Should not create todo with invalid data body', (done) => {
			const text = '';

			request(app)
				.post('/todos')
				.set('x-auth',dummyUser[0].tokens[0].token)
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
				.set('x-auth',dummyUser[0].tokens[0].token)
				.send(update)
				.expect(200)
				.expect((res) => {
					expect(typeof res.body.obj.completedAt).toBe('number');
					expect(res.body.obj.text).toBe(update.text);
					expect(res.body.obj.completed).toBe(update.completed);
				})
				.end(done);
		});

		it('Should not update todo created by other user', (done) => {
			const update = {
				text: "Updated first todo",
				completed: true
			};

			request(app)
				.patch(`/todos/${dummyTodo[0]._id.toHexString()}`)
				.set('x-auth', dummyUser[1].tokens[0].token)
				.send(update)
				.expect(404)
				.expect((res) => {
					expect(res.body).toEqual({});
				})
				.end(done);
		});

		it('Should null/undefined completedAt when todo not completed', (done) => {
			const update = {
				completed: false
			};

			request(app)
				.patch(`/todos/${dummyTodo[0]._id.toHexString()}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
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
			const todoId = dummyTodo[0]._id.toHexString();

			request(app)
				.delete(`/todos/${todoId}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(200)
				.expect((res) => {
					expect(res.body.obj._id).toBe(todoId);
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					Todo.findById(todoId).then((obj) => {
						expect(obj).toBeFalsy();
						done()
					}).catch((e) => {
						done(e);
					})
				})
		});

		it('Should not delete todo created by other user', (done) => {
			const todoId = dummyTodo[1]._id.toHexString();

			request(app)
				.delete(`/todos/${todoId}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(404)
				.expect((res) => {
					expect(res.body).toEqual({});
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					Todo.findById(todoId).then((obj) => {
						expect(obj).toBeTruthy();
						done()
					}).catch((e) => {
						done(e);
					})
				})
		});

		it('Should not delete todo if ObjectID not valid', (done) => {
			request(app)
				.delete('/todos/123abc')
				.set('x-auth',dummyUser[0].tokens[0].token)
				.expect(400)
				.expect((res) => {
					expect(res.body).toEqual({});
				})
				.end(done);
		});

		it('Should not delete todo if ObjectID not found', (done) => {
			request(app)
				.delete(`/todos/${new ObjectID()}`)
				.set('x-auth',dummyUser[0].tokens[0].token)
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
					expect(res.body._id).toBeTruthy();
					expect(res.header['x-auth']).toBeTruthy();
				})
				.end((err) => {
					if (err) {
						return done(err);
					}

					User.findOne({email}).then((obj) => {
						if (!obj) {
							return done(new Error());
						}

						expect(obj).toBeTruthy();
						expect(obj.password).not.toBe(password);
						done();
					}).catch((e) => {
						return done(e);
					})
				});
		});

		it('Should not create user if email is not unique', (done) => {

			const email = 'userOne@examples.com';
			const password = 'secretOne';

			request(app)
				.post('/users')
				.send({email, password})
				.expect(400)
				.end(done);
		});

		it('Should return validation error if request invalid', (done) => {
			const email = '';
			const password = 'adfgfx';

			request(app)
				.post('/users')
				.send({email, password})
				.expect(400)
				.end(done);
		});
	});

	describe('POST /users/login', () => {
		it('Should return auth token if user credentials is match', (done) => {
			const {email, password} = _.pick(dummyUser[1], ['email', 'password']);

			request(app)
				.post('/users/login')
				.send({email, password})
				.expect(200)
				.expect((res) => {
					expect(res.header['x-auth']).toBeTruthy();
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					User.findById(dummyUser[1]._id).then((obj) => {
						expect(obj.toObject().tokens[1]).toMatchObject({
							access: 'auth',
							token: res.header['x-auth']
						});
						done();
					}).catch((e) => {
						return done(e);
					});
				});
		});

		it('Should not return auth token if credentials is not match or invalid data body', (done) => {
			request(app)
				.post('/users/login')
				.send({
					email: 'userTwo@examples.com',
					password: 'secretTow'
				})
				.expect(400)
				.expect((res) => {
					expect(res.header['x-auth']).toBeFalsy();
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					User.findById(dummyUser[1]._id).then((obj) => {
						expect(obj.tokens.length).toBe(1);
						done()
					}).catch((e) => {
						return done(e);
					});
				});
		});
	});

	describe('DELETE /users/me/token', () => {
		it('Should delete user auth token on logout', (done) => {
			request(app)
				.delete('/users/me/token')
				.set('x-auth', dummyUser[0].tokens[0].token)
				.expect(200)
				.end((err, res) => {
					if(err){
						return done(err);
					}

					User.findById(dummyUser[0]._id).then((obj) => {
						expect(obj.tokens.length).toBe(0);
						done();
					}).catch((e) => {
						return done(e);
					})
			});
		});

		it('Should return 401 if auth token not valid', (done) => {
			request(app)
				.delete('/users/me/token')
				.set('x-auth', '')
				.expect(401)
				.end(done);
		});
	});
});
