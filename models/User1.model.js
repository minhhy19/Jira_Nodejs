var rep = require('./Repository');

exports.addUser = async (o) => {
	return await rep.add('User', o);
}

exports.getUserByEmail = async (email) => {
	return await rep.fetchByEmail('User', email);
}

exports.getUserById = async (id) => {
	return await rep.fetchOne('User', id);
}