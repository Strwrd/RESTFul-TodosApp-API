//Third Party Modules
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

//Define User Schema
const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		require: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email!',
			isAsync: true
		}
	},
	password: {
		type: String,
		require: true,
		minlength: 6
	},
	tokens: [{
		access: {
			type: String,
			require: true
		},
		token: {
			type: String,
			require: true
		}
	}]
}, {
	usePushEach : true
});

//  Model Instance Method override toJSON function
UserSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	return _.pick(userObject,['_id','email'])
};

// Model Instance Method generateAuthToken
UserSchema.methods.generateAuthToken = function () {
	const user = this;
	const access = 'auth';
	const token = jwt.sign({ _id: user._id.toHexString(),access},'secret').toString();

	user.tokens.push({access, token});

	return user.save().then(() => {
		return token;
	});
};

//Creating User Model
const User = mongoose.model('User', UserSchema);

module.exports = {User};