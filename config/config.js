//Init env
const env = process.env.NODE_ENV || 'development';

//Select env based on run command
if (env === 'development'){
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://127.0.0.1/TodosApp';
}else if (env === 'test') {
	process.env.PORT = 3000;
	process.env.MONGODB_URI = 'mongodb://127.0.0.01/TodosAppTest'
}