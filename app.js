//Config env
require('./config/config');

//Third-Party Modules
const express = require('express');
const bodyParser = require('body-parser');

//Local Modules
const todos = require('./routes/todo');

//Init App
const app = express();
const port = process.env.PORT;

//Config App
app.use(bodyParser.json());
app.use('/',todos);

//App Bind Port
app.listen(port,() => {
	console.log(`App is starting at port ${port}`);
});

//Export Module
module.exports = {
	app
};




