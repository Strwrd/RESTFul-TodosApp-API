//Third Party Modules
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
	usePushEach: true
});

//  Model Instance Method override toJSON function
UserSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();
	return _.pick(userObject, ['_id', 'email']);
};

// Model Instance Method generateAuthToken
UserSchema.methods.generateAuthToken = async function () {
	const user = this;
	const access = 'auth';
	const token = await jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET ).toString();
	user.tokens.push({access, token});
	user.save();
	return token;
};

// Model Instace Method removeToken
UserSchema.methods.removeToken = function (token) {
	const user = this;
	return user.update({
		$pull : {
			tokens : {
				token
			}
		}
	});
};

// Static Method findByToken
UserSchema.statics.findByToken = async function (token) {
	const User = this;

	try {
		const decoded = await jwt.verify(token, process.env.JWT_SECRET);
		return User.findOne({
			'_id' : decoded._id,
			'tokens.token' : token,
			'tokens.access' : 'auth'
		});
	} catch (e) {
		return Promise.reject();
	}
};

// Static Method findByCredential
UserSchema.statics.findByCredentials = async function (email, password) {
	const User = this;

	const user = await User.findOne({email});
	if(!user){
		return Promise.reject();
	}

	const status = await bcrypt.compare(password, user.password);
	if(status){
		return Promise.resolve(user);
	}else {
		return Promise.reject();
	}
};

// Execute before save user
UserSchema.pre('save', async function (next) {
	const user = this;

	if(user.isModified('password')){
		try{
			const salt = await bcrypt.genSalt(10);
			const pass = await bcrypt.hash(user.password, salt);
			user.password = pass;
			next();
		}catch (e){
			console.log(e);
		}
	}else{
		next();
	}
});

//Creating User Model
const User = mongoose.model('User', UserSchema);

//Export Module
module.exports = {User};