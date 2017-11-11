//Config env
require('./config/config');

//Third-Party Modules
const express = require('express');
const bodyParser = require('body-parser');

//Local Modules
const todos = require('./routes/todo');
const users = require('./routes/user');

//Init App
const app = express();
const port = process.env.PORT;

//Config App
app.use(bodyParser.json());
app.use('/',todos);
app.use('/', users);

//App Bind Port
app.listen(port,() => {
	console.log(`App is starting at port ${port}`);
});

//Export Module
module.exports = {
	app
};




