// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const CryptoJS = require('crypto-js');
const logger = require('../../../loggerService');
const {
	registerValidation,
	loginValidation,
	editUserValidation
} = require('../validations/user.validation');
const {
	signAccessToken
} = require('../../../helpers/jwt_helpers');
// var TokenModel = require('../models/Token.model');
const UserModel = require('../models/User.model');
const ProjectModel = require('../../project/models/Project.model');

function logInfo(str) {
	console.log(str);
	logger.info(str);
}

module.exports = {
	signup: async (req, res) => {
		const {
			email, passWord, name, phoneNumber
		} = req.body;
		const response = {
			statusCode: 400,
			message: 'Register failed!',
			content: {
				email,
				passWord,
				name,
				phoneNumber
			}
		};
		try {
			logInfo(`[USER] >> [SIGNUP] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = registerValidation(req.body);

			if (error) {
				logInfo(`[ERROR USER] [SIGNUP] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Checking if the user is already in the database
			const emailExist = await UserModel.findOne({ email });
			if (emailExist) {
				logInfo('[ERROR USER] [SIGNUP] Email already exists!');
				response.message = 'Email already exists!';
				return res.status(response.statusCode).send(response);
			}

			// Hash passwords
			const hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);

			const user = {
				name,
				email,
				passWord: hashedPassword,
				avatar: `https://ui-avatars.com/api/?name=${name}`,
				phoneNumber
			};

			const saveUser = await UserModel.create(user);
			response.statusCode = 200;
			response.message = 'Register successfully!';
			logInfo(`[USER] >> [SIGNUP] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR USER] [SIGNUP] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	signin: async (req, res) => {
		const { email, passWord } = req.body;
		let response = {
			statusCode: 400,
			message: 'Incorrect email or password!',
			content: {
				email,
				passWord
			}
		};
		try {
			logInfo(`[USER] >> [SIGN IN] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = loginValidation(req.body);

			if (error) {
				logInfo(`[ERROR USER] [SIGN IN] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Checking if the email exist
			const user = await UserModel.findOne({ email });
			if (!user) {
				logInfo('[ERROR USER] [SIGN IN] Email is wrong!');
				response.message = 'Email is wrong!';
				return res.status(response.statusCode).send(response);
			}

			// PASSWORD IS CORRECT
			const hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);
			if (hashedPassword !== user.passWord) {
				logInfo('[ERROR USER] [SIGN IN] Invalid password');
				response.message = 'Invalid password';
				return res.status(response.statusCode).send(response);
			}

			// Create and assign a token
			const dataUserInternal = _.pick(user, [
				'email',
				'avatar',
				'phoneNumber',
				'name'
			]);
			const accessToken = await signAccessToken(
				_.toString(user.userId),
				dataUserInternal
			);
			// var refreshToken = await signRefreshToken(String(user._id));

			response = {
				statusCode: 200,
				message: 'Login successfully!',
				content: {
					id: user.userId,
					...dataUserInternal,
					accessToken
				}
			};
			logInfo(`[USER] >> [SIGN IN] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (error) {
			logInfo(`[ERROR USER] [SIGN IN] ${JSON.stringify(error)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	editUser: async (req, res) => {
		const {
			id, email, passWord, name, phoneNumber
		} = req.body;
		const response = {
			statusCode: 400,
			message: 'Update account info failed',
			content: null
		};

		try {
			logInfo(`[USER] >> [EDIT USER] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = editUserValidation(req.body);

			if (error) {
				logInfo(`[ERROR USER] [EDIT USER] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Kiểm tra user trong db
			const userExist = await UserModel.findOne({ userId: id });
			if (!userExist) {
				logInfo(
					'[ERROR USER] [EDIT USER] Account info not found'
				);
				response.message = 'Account info not found';
				return res.status(response.statusCode).send(response);
			}

			// Checking if the user is already in the database
			const emailExist = await UserModel.findOne({
				email,
				userId: {
					$ne: userExist.userId
				}
			});
			if (emailExist) {
				logInfo('[ERROR USER] [EDIT USER] Email already exists!');
				response.message = 'Email already exists!';
				return res.status(response.statusCode).send(response);
			}

			// Hash passwords
			const hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);

			const updated = await UserModel.updateOne(
				{ userId: userExist.userId },
				{
					email,
					passWord: hashedPassword,
					name,
					phoneNumber
				}
			);

			if (!updated) {
				logInfo('[ERROR USER] [EDIT USER] Update account info failed, please try again');
				response.message = 'Update account info failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update account info successfully';
			logInfo(`[USER] >> [EDIT USER] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR USER] [EDIT USER] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	deleteUser: async (req, res) => {
		const { id } = req.query;
		const response = {
			statusCode: 400,
			message: 'Delete user failed',
			content: null
		};

		try {
			logInfo(
				`[USER] >> [DELETE USER] params ${JSON.stringify(req.query)}`
			);

			// Nếu tài khoản xóa khác với tài khoản đã đăng nhập thì trả lỗi 401
			if (id !== req.user.aud) {
				logInfo(
					'[ERROR USER] [DELETE USER] The account is different from the one logged in'
				);
				return res.status(403).send('The account is different from the one logged in');
			}

			const projectCreatedByUser = await ProjectModel.findOne({
				'creator.id': +id
			});
			if (projectCreatedByUser) {
				logInfo(
					'[ERROR USER] [DELETE USER] User created the project cannot be deleted!'
				);
				response.message = 'User created the project cannot be deleted!';
				return res.status(response.statusCode).send(response);
			}

			const deleted = await UserModel.deleteOne({ userId: id });

			if (!deleted || deleted.deletedCount < 1) {
				logInfo(
					'[ERROR USER] [DELETE USER] Delete user failed, please try again'
				);
				response.message = 'Delete user failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Delete user successfully';
			logInfo(
				`[USER] >> [DELETE USER] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR USER] [DELETE USER] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	getUserByProjectId: async (req, res) => {
		const idProject = _.get(req, 'query.idProject', null);
		const response = {
			statusCode: 400,
			message: 'Delete user failed',
			content: null
		};

		try {
			logInfo(
				`[USER] >> [GET USER BY PROJECTID] params ${JSON.stringify(req.query)}`
			);

			if (idProject === null) {
				logInfo(
					'[ERROR USER] [GET USER BY PROJECTID] ProjectId not found'
				);
				response.statusCode = 404;
				response.message = 'ProjectId not found!';
				return res.status(404).send(response);
			}

			const fetchUserByProjectId = await ProjectModel.findOne({ id: idProject });
			if (!fetchUserByProjectId) {
				logInfo(
					'[ERROR USER] [GET USER BY PROJECTID] ProjectId not found'
				);
				response.message = 'ProjectId not found';
				return res.status(404).send(response);
			}

			if (fetchUserByProjectId.members.length < 1) {
				logInfo(
					'[ERROR USER] [GET USER BY PROJECTID] User not found in the project!'
				);
				response.message = 'User not found in the project!';
				return res.status(404).send(response);
			}

			response.statusCode = 200;
			response.message = 'Request successfully';
			response.content = fetchUserByProjectId.members;
			logInfo(
				`[USER] >> [GET USER BY PROJECTID] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR USER] [GET USER BY PROJECTID] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	getUser: async (req, res) => {
		const query = {
			...(req.query.keyword && { $text: { $search: req.query.keyword } })
		};
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo('[USER] >> [GET USER]');

			let userAll = await UserModel.find(query);
			userAll = userAll.map((user) => ({
				userId: user.userId,
				name: user.name,
				avatar: user.avatar,
				email: user.email,
				phoneNumber: user.phoneNumber
			}));

			response.statusCode = 200;
			response.message = 'Get list user successfully!';
			response.content = userAll;
			logInfo(
				`[USER] >> [GET USER] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR USER] [GET USER] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	}

	// refreshToken: async (req, res) => {
	// 	try {
	// 		const { refreshToken } = req.body;
	// 		// if (!refreshToken) throw createError.BadRequest();
	// 		if (!refreshToken) throw '400';

	// 		const checkTokenDb = await TokenModel.getTokenByRefreshToken(refreshToken);
	// 		if (!checkTokenDb) throw '403';

	// 		const userId = await verifyRefreshToken(refreshToken);
	// 		const accessToken = await signAccessToken(userId);
	// 		// var refreshToken = await signRefreshToken(userId);
	// 		res
	// 			.header('authorization', accessToken)
	// 			.send({ code: '200', msg: { accessToken } });
	// 	} catch (err) {
	// 		if (err === '400') {
	// 			res.send({ code: '400', msg: 'No Refresh Token' });
	// 		} else if (err === '403') {
	// 			res.send({ code: '403', msg: 'Forbidden' });
	// 		} else {
	// 			res.send({ code: '500', msg: err });
	// 		}
	// 	}
	// },

	// logout: async (req, res, next) => {
	// 	try {
	// 		const { refreshToken } = req.body;
	// 		if (!refreshToken) throw '400';

	// 		const userId = await verifyRefreshToken(refreshToken);

	// 		// delete refresh token
	// 		const a = await TokenModel.getTokenByIdUser(userId);
	// 		const arr = a.value.filter((ref) => ref !== refreshToken);
	// 		await TokenModel.updateTokenByIdUser(userId, { value: arr });
	// 		// var deleteToken = await TokenModel.deleteTokenByUserId(userId);
	// 		// logInfo(userId);
	// 		// logInfo(deleteToken);
	// 		res.send({ code: '200', msg: 'success' });
	// 	} catch (error) {
	// 		if (error === '400') {
	// 			res.send({ code: '400', msg: 'No Refresh Token' });
	// 		} else if (error === '403') {
	// 			res.send({ code: '403', msg: 'Forbidden' });
	// 		} else {
	// 			res.send({ code: '500', msg: error });
	// 		}
	// 	}
	// }
};
