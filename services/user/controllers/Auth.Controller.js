// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const CryptoJS = require('crypto-js');
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

module.exports = {
	signup: async (req, res) => {
		const {
			email, passWord, name, phoneNumber
		} = req.body;
		const response = {
			statusCode: 400,
			message: 'Đăng ký tài khoản thất bại!',
			content: {
				email,
				passWord,
				name,
				phoneNumber
			}
		};
		try {
			console.log(`[USER] >> [SIGNUP] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = registerValidation(req.body);

			if (error) {
				console.log('[ERROR USER] [SIGNUP] ', JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			// Checking if the user is already in the database
			const emailExist = await UserModel.findOne({ email });
			if (emailExist) {
				console.log('[ERROR USER] [SIGNUP] Email đã được sử dụng!');
				response.message = 'Email đã được sử dụng!';
				return res.send(response);
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
			response.message = 'Đăng ký tài khoản thành công!';
			console.log(`[USER] >> [SIGNUP] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (err) {
			console.log('[ERROR USER] [SIGNUP] ', JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	signin: async (req, res) => {
		const { email, passWord } = req.body;
		let response = {
			statusCode: 400,
			message: 'Tài khoản hoặc mật khẩu không đúng!',
			content: {
				email,
				passWord
			}
		};
		try {
			console.log(`[USER] >> [SIGN IN] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = loginValidation(req.body);

			if (error) {
				console.log('[ERROR USER] [SIGNUP] ', JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			// Checking if the email exist
			const user = await UserModel.findOne({ email });
			if (!user) {
				console.log('[ERROR USER] [SIGN IN] Email is wrong!');
				response.message = 'Email is wrong!';
				return res.send(response);
			}

			// PASSWORD IS CORRECT
			const hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);
			if (hashedPassword !== user.passWord) {
				console.log('[ERROR USER] [SIGN IN] Invalid password');
				response.message = 'Invalid password';
				return res.send(response);
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
				message: 'Đăng nhập thành công!',
				content: {
					id: user.userId,
					...dataUserInternal,
					accessToken
				}
			};
			console.log(`[USER] >> [SIGN IN] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (error) {
			console.log('[ERROR USER] [SIGN IN] ', JSON.stringify(error));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	editUser: async (req, res) => {
		const {
			id, email, passWord, name, phoneNumber
		} = req.body;
		const response = {
			statusCode: 400,
			message: 'Cập nhật thông tin tài khoản thất bại',
			content: null
		};

		try {
			console.log(`[USER] >> [EDIT USER] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = editUserValidation(req.body);

			if (error) {
				console.log('[ERROR USER] [EDIT USER] ', JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			// Kiểm tra user trong db
			const userExist = await UserModel.findOne({ userId: id });
			if (!userExist) {
				console.log(
					'[ERROR USER] [EDIT USER] Không tìm thấy thông tin tài khoản'
				);
				response.message = 'Không tìm thấy thông tin tài khoản';
				return res.send(response);
			}

			// Checking if the user is already in the database
			const emailExist = await UserModel.findOne({
				email,
				userId: {
					$ne: userExist.userId
				}
			});
			if (emailExist) {
				console.log('[ERROR USER] [EDIT USER] Email đã được sử dụng!');
				response.message = 'Email đã được sử dụng!';
				return res.send(response);
			}

			// Hash passwords
			const hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);

			console.log(hashedPassword);

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
				console.log('[ERROR USER] [EDIT USER] Cập nhật thông tin tài khoản thất bại, vui lòng thử lại');
				response.message = 'Cập nhật thông tin tài khoản thất bại, vui lòng thử lại';
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Cập nhật thông tin tài khoản thành công';
			console.log(`[USER] >> [EDIT USER] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (err) {
			console.log('[ERROR USER] [EDIT USER] ', JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	deleteUser: async (req, res) => {
		const { id } = req.query;
		const response = {
			statusCode: 400,
			message: 'Xóa tài khoản thất bại',
			content: null
		};

		try {
			console.log(
				`[USER] >> [DELETE USER] params ${JSON.stringify(req.query)}`
			);

			// Nếu tài khoản xóa khác với tài khoản đã đăng nhập thì trả lỗi 401
			if (id !== req.user.aud) {
				console.log(
					'[ERROR USER] [DELETE USER] Tài khoản khác với tài khoản đã đăng nhập'
				);
				return res.status(401).send('Access Denied');
			}

			const deleted = await UserModel.deleteOne({ userId: id });

			if (!deleted || deleted.deletedCount < 1) {
				console.log(
					'[ERROR USER] [DELETE USER] Xóa tài khoản thất bại, vui lòng thử lại'
				);
				response.message = 'Xóa tài khoản thất bại, vui lòng thử lại';
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Xóa tài khoản thành công';
			console.log(
				`[USER] >> [DELETE USER] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR USER] [DELETE USER] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	getUserByProjectId: async (req, res) => {
		const idProject = _.get(req, 'query.idProject', null);
		const response = {
			statusCode: 400,
			message: 'Xóa tài khoản thất bại',
			content: null
		};

		try {
			console.log(
				`[USER] >> [DELETE USER] params ${JSON.stringify(req.query)}`
			);

			if (idProject === null) {
				console.log(
					'[ERROR USER] [GET USER BY PROJECTID] Không tìm thấy projectId'
				);
				response.statusCode = 404;
				response.message = 'User not found in the project!';
				return res.status(404).send(response);
			}

			const fetchUserByProjectId = await ProjectModel.findOne({ id: idProject });
			if (!fetchUserByProjectId) {
				console.log(
					'[ERROR USER] [GET USER BY PROJECTID] Không tìm thấy projectId'
				);
				response.message = 'Không tìm thấy projectId';
				return res.status(404).send(response);
			}

			if (fetchUserByProjectId.members.length < 1) {
				console.log(
					'[ERROR USER] [GET USER BY PROJECTID] User not found in the project!'
				);
				response.message = 'User not found in the project!';
				return res.status(404).send(response);
			}

			response.statusCode = 200;
			response.message = 'Xử lý thành công';
			response.content = fetchUserByProjectId.members;
			console.log(
				`[USER] >> [GET USER BY PROJECTID] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR USER] [GET USER BY PROJECTID] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	getUser: async (req, res) => {
		const query = {
			...(req.query.keyword && { $text: { $search: req.query.keyword } })
		};
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log('[USER] >> [GET USER]');

			let userAll = await UserModel.find(query);
			userAll = userAll.map((user) => ({
				userId: user.userId,
				name: user.name,
				avatar: user.avatar,
				email: user.email,
				phoneNumber: user.phoneNumber
			}));

			response.statusCode = 200;
			response.message = 'Lấy danh sách user thành công!';
			response.content = userAll;
			console.log(
				`[USER] >> [GET USER] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log('[ERROR USER] [GET USER] ', JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

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
	// 		// console.log(userId);
	// 		// console.log(deleteToken);
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
