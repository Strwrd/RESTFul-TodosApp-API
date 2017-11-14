//Third Party Modules
const mongoose = require('mongoose');

//Define Schema and Creating Model
const Todo = mongoose.model('Todo',{
	text : {
		type : String,
		required : true,
		minlength : 1,
		trim : true
	},
	completed : {
		type : Boolean,
		default : false
	},
	completedAt : {
		type : Number,
		default: null
	},
	creator : {
		required: true,
		type : mongoose.Schema.Types.ObjectId
	}
});

//Export Module
module.exports = {Todo};
