//Third Party Modules
const mongoose = require('mongoose');
const validator = require('validator');

//Define Schema and creating model
const User = mongoose.model('User', {
	email : {
		type: String,
		require: true,
		trim : true,
		minlength : 1,
		unique : true,
		validate : {
			validator : validator.isEmail,
			message : '{VALUE} is not a valid email!',
			isAsync: true
		}
	},
	password : {
		type: String,
		require: true,
		minlength: 6
	},
	tokens : [{
		access : {
			type : String,
			require : true
		},
		tokens: {
			type : String,
			require: true
		}
	}]
});

module.exports = {User};