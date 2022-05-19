const jwt = require('jsonwebtoken');
const logger = require('../loggerService');

function logInfo(str) {
	console.log(str);
	logger.info(str);
}

module.exports = {
	signAccessToken: (userId, payload) => new Promise((resolve, reject) => {
		const secret = process.env.ACCESS_TOKEN_SECRET;
		const options = {
			expiresIn: '7d',
			audience: userId
		};
		jwt.sign(payload, secret, options, (err, token) => {
			if (err) {
				logInfo(err.message);
				reject(err);
			}
			resolve(token);
		});
	}),

	verifyAccessToken: (req, res, next) => {
		logInfo(`[VERIFY ACCESS TOKEN] >> [PAYLOAD] ${JSON.stringify(req.headers)}`);
		let token = req.headers.authorization;
		if (!token) return res.status(401).send('Access Denied');
		[, token] = token.split(' ');
		if (token === 'undefined') return res.status(401).send('Access Denied');

		try {
			const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			req.user = verified;
		} catch (err) {
			logInfo(`[VERIFY ACCESS TOKEN] >> [ERROR] ${JSON.stringify(err)}`);
			if (err.name === 'JsonWebTokenError') {
				return res.status(401).send('Unauthorized');
			}
			if (err.name === 'TokenExpiredError') {
				return res.status(401).send(err.message || 'jwt expired');
			}
			return res.status(400).send('Invalid Token');
			// res.send({ statusCode: 400, message: err });
		}
		return next();
	}

	// signRefreshToken: (userId) => {
	// 	return new Promise((resolve, reject) => {
	// 		const payload = {};
	// 		const secret = process.env.REFRESH_TOKEN_SECRET
	// 		const options = {
	// 			expiresIn: '2d',
	// 			audience: userId
	// 		}
	// 		jwt.sign(payload, secret, options, async (err, token) => {
	// 			if (err) {
	// 				console.log(err.message);
	// 				reject(err);
	// 				// reject(createError.InternalServerError());
	// 			}
	// 			try {
	// 				// Add and update refresh token
	// 				var checkToken = await TokenModel.getTokenByIdUser(userId);
	// 				if (!checkToken) {
	// 					await TokenModel.addToken({
	// 						idUser: userId,
	// 						value: [token]
	// 					})
	// 				} else {
	// 					const array = checkToken.value;
	// 					array.push(token);
	// 					await TokenModel.updateTokenByIdUser(userId, { value: array });
	// 				}
	// 			} catch (error) {
	// 				reject(err);
	// 			}

	// 			resolve(token);
	// 		})
	// 	});
	// },
	// verifyRefreshToken: (refreshToken) => {
	// 	return new Promise((resolve, reject) => {
	// 		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, payload) => {
	// 			if (err) {
	// 				if (err.message === 'jwt expired') {  // delete refresh token in db when token expired
	// 					try {
	// 						// console.log('token het han');
	// 						const a = await TokenModel.getTokenByRefreshTokenArray(refreshToken);
	// 						const arr = a.value.filter(ref => ref !== refreshToken);
	// 						await TokenModel.updateTokenByIdUser(a.idUser, { value: arr });
	// 					} catch (e) { reject(e); }

	// 				}
	// 				return reject(err);
	// 			}
	// 			var userId = payload.aud;
	// 			try {
	// 				const userToken = await TokenModel.getTokenByIdUser(userId);
	// 				// if(refreshToken === userToken.value) {
	// 				if (userToken.value.includes(refreshToken)) {
	// 					resolve(userId);
	// 				} else throw '403';
	// 			} catch (error) {
	// 				reject(error);
	// 			}
	// 		})
	// 	})
	// }
};
