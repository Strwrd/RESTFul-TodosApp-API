//Third Party Modules
const mongoose = require('mongoose');

//Config for mongoDB
const config = {
	useMongoClient: true
};

//Setting for mongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, config);

//Export Module
module.exports = {mongoose};