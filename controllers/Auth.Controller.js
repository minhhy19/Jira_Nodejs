var UserModel = require('../models/User.model.js');
var CryptoJS = require('crypto-js');
var createError = require('http-errors');
var { registerValidation, loginValidation } = require('../helpers/validation');
var { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helpers');
var TokenModel = require('../models/Token.model');

module.exports = {
    signup: async (req, res) => {
        // LETS VALIDATE THE DATA BEFORE WE A USER
        var { error } = registerValidation(req.body);
        if (error) return res.send({ code: '400', msg: error.details[0].message });

        //Checking if the user is already in the database
        var emailExist = await UserModel.getUserByEmail(req.body.email);
        if (emailExist) return res.send({ code: '400', msg: 'Email already exists' });

        // Hash passwords
        var hashedPassword = await CryptoJS.SHA256(req.body.password + process.env.HASH_PASS_USER).toString(CryptoJS.enc.Hex);

        var user = {
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        };
        try {
            var saveUser = await UserModel.addUser(user);
            res.send({ code: '200', userId: saveUser.insertedId });
        } catch (err) {
            res.send({ code: '500', msg: 'Internal Server Error' });
        }
    },

    login: async (req, res) => {
        // LETS VALIDATE THE DATA BEFORE WE A USER
        var { error } = loginValidation(req.body);
        if (error) return res.send({ code: '400', msg: error.details[0].message });

        // Checking if the username exist
        var user = await UserModel.getUserByUsername(req.body.username);
        if (!user) return res.send({ code: '400', msg: 'Username is wrong!' });

        // PASSWORD IS CORRECT
        var hashedPassword = await CryptoJS.SHA256(req.body.password + process.env.HASH_PASS_USER).toString(CryptoJS.enc.Hex);
        if (hashedPassword !== user.password) return res.send({ code: '400', msg: 'Invalid password' });


        // Create and assign a token
        var accessToken = await signAccessToken(String(user._id));
        var refreshToken = await signRefreshToken(String(user._id));

        res.header('authorization', accessToken).send({ code: '200', msg: { accessToken, refreshToken } });

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
            res.header('authorization', accessToken).send({ code: '200', msg: { accessToken } });
        } catch (err) {
            if (err === '400') {
                res.send({ code: "400", msg: "No Refresh Token" });
            } else if (err === '403') {
                res.send({ code: "403", msg: "Forbidden" });
            } else {
                res.send({ code: "500", msg: err });
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
            var arr = a.value.filter(ref => ref !== refreshToken);
            await TokenModel.updateTokenByIdUser(userId, { value: arr });
            // var deleteToken = await TokenModel.deleteTokenByUserId(userId);
            // console.log(userId);
            // console.log(deleteToken);
            res.send({ code: '200', msg: "success" });
        } catch (error) {
            if (error === '400') {
                res.send({ code: "400", msg: "No Refresh Token" });
            } else if (error === '403') {
                res.send({ code: "403", msg: "Forbidden" });
            } else {
                res.send({ code: "500", msg: error });
            }
        }
    }
}