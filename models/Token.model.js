var rep = require('./Repository');

exports.getTokenByIdUser = async (idUser) => {
	return await rep.fetchTokenByIdUser('Token', idUser);
}

exports.getTokenByRefreshToken = async (token) => {
	return await rep.fetchTokenByRefreshToken('Token', token);
}

exports.getTokenByRefreshTokenArray = async (token) => {
	return await rep.fetchTokenByRefreshTokenArray('Token', token);
}


exports.addToken = async (o) => {
	return await rep.add('Token', o);
}

exports.updateTokenByIdUser = async (idUser, o) => {
	return await rep.updateTokenByIdUser('Token', idUser, o);
}

exports.deleteTokenByUserId = async (idUser) => {
	return await rep.deleteTokenByUserId('Token', idUser);
}