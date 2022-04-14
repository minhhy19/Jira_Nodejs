// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
var CryptoJS = require('crypto-js');
var createError = require('http-errors');
var {
	registerValidation,
	loginValidation,
	editUserValidation
} = require('../helpers/validationUser');
var {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken
} = require('../helpers/jwt_helpers');
var TokenModel = require('../models/Token.model');
const User = require('../models/User.model');

module.exports = {
	signup: async (req, res) => {
		try {
			const { email, passWord, name, phoneNumber } = req.body;
			console.log(`[USER] >> [SIGNUP] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			var { error } = registerValidation(req.body);
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

			if (error) {
				console.log(`[ERROR USER] [SIGNUP] `, JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			//Checking if the user is already in the database
			var emailExist = await User.findOne({ email });
			if (emailExist) {
				console.log('[ERROR USER] [SIGNUP] Email đã được sử dụng!');
				response.message = 'Email đã được sử dụng!';
				return res.send(response);
			}

			// Hash passwords
			const hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);

			var user = {
				name,
				email,
				passWord: hashedPassword,
				avatar: `https://ui-avatars.com/api/?name=${name}`,
				phoneNumber
			};

			var saveUser = await User.create(user);
			response.statusCode = 200;
			response.message = 'Đăng ký tài khoản thành công!';
			console.log(`[USER] >> [SIGNUP] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR USER] [SIGNUP] `, JSON.stringify(err));
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
			console.log(`[USER] >> [SIGNIN] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = loginValidation(req.body);

			if (error) {
				console.log(`[ERROR USER] [SIGNUP] `, JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			// Checking if the email exist
			var user = await User.findOne({ email });
			if (!user) {
				console.log('[ERROR USER] [SIGNIN] Email is wrong!');
				response.message = 'Email is wrong!';
				return res.send(response);
			}

			// PASSWORD IS CORRECT
			var hashedPassword = await CryptoJS.SHA256(
				passWord + process.env.HASH_PASS_USER
			).toString(CryptoJS.enc.Hex);
			if (hashedPassword !== user.passWord) {
				console.log('[ERROR USER] [SIGNIN] Invalid password');
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
			var accessToken = await signAccessToken(
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
			console.log(`[USER] >> [SIGNIN] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (error) {
			console.log(`[ERROR USER] [SIGNIN] `, JSON.stringify(error));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	editUser: async (req, res) => {
		const { id, email, passWord, name, phoneNumber } = req.body;
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
				console.log(`[ERROR USER] [EDIT USER] `, JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			// Kiểm tra user trong db
			const userExist = await User.findOne({ userId: id });
			if (!userExist) {
				console.log(
					'[ERROR USER] [EDIT USER] Không tìm thấy thông tin tài khoản'
				);
				response.message = 'Không tìm thấy thông tin tài khoản';
				return res.send(response);
			}

			//Checking if the user is already in the database
			const emailExist = await User.findOne({
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

			const updated = await User.updateOne(
				{ userId: userExist.userId },
				{
					email,
					passWord: hashedPassword,
					name,
					phoneNumber
				}
			);

			if (!updated) {
				response.message =
					'Cập nhật thông tin tài khoản thất bại, vui lòng thử lại';
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Cập nhật thông tin tài khoản thành công';
			console.log(`[USER] >> [EDIT USER] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR USER] [EDIT USER] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	deleteUser: async (req, res) => {
		const id = req.query.id;
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
				console.log('[ERROR USER] [DELETE USER] Tài khoản khác với tài khoản đã đăng nhập');
				return res.status(401).send('Access Denied');
			}

			const deleted = await User.deleteOne({ userId: id });

			if (!deleted || deleted.deletedCount < 1) {
				console.log('[ERROR USER] [DELETE USER] Xóa tài khoản thất bại, vui lòng thử lại');
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

	refreshToken: async (req, res) => {
		try {
			var { refreshToken } = req.body;
			// if (!refreshToken) throw createError.BadRequest();
			if (!refreshToken) throw '400';

			var checkTokenDb = await TokenModel.getTokenByRefreshToken(refreshToken);
			if (!checkTokenDb) throw '403';

			var userId = await verifyRefreshToken(refreshToken);
			var accessToken = await signAccessToken(userId);
			// var refreshToken = await signRefreshToken(userId);
			res
				.header('authorization', accessToken)
				.send({ code: '200', msg: { accessToken } });
		} catch (err) {
			if (err === '400') {
				res.send({ code: '400', msg: 'No Refresh Token' });
			} else if (err === '403') {
				res.send({ code: '403', msg: 'Forbidden' });
			} else {
				res.send({ code: '500', msg: err });
			}
		}
	},

	logout: async (req, res, next) => {
		try {
			var { refreshToken } = req.body;
			if (!refreshToken) throw '400';

			var userId = await verifyRefreshToken(refreshToken);

			// delete refresh token
			var a = await TokenModel.getTokenByIdUser(userId);
			var arr = a.value.filter((ref) => ref !== refreshToken);
			await TokenModel.updateTokenByIdUser(userId, { value: arr });
			// var deleteToken = await TokenModel.deleteTokenByUserId(userId);
			// console.log(userId);
			// console.log(deleteToken);
			res.send({ code: '200', msg: 'success' });
		} catch (error) {
			if (error === '400') {
				res.send({ code: '400', msg: 'No Refresh Token' });
			} else if (error === '403') {
				res.send({ code: '403', msg: 'Forbidden' });
			} else {
				res.send({ code: '500', msg: error });
			}
		}
	}
};
