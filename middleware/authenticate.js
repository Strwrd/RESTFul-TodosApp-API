//Local Module
const {User} = require('./../models/user');

const authenticate = (req, res, next) => {
	const token = req.header('x-auth');

	User.findByToken(token).then((user) => {
		if(!user){
			return Promise.reject();
		}

		req.user = user;
		req.token = token;
		next();
	}).catch((e) => {
		return res.status(401).send();
	});
};

//Export Modules
module.exports = {
	authenticate
};