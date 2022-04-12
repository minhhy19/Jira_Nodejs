var UserModel = require("../models/User.model.js");
var CryptoJS = require("crypto-js");
var createError = require("http-errors");
var { registerValidation, loginValidation } = require("../helpers/validation");
var {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helpers");
var TokenModel = require("../models/Token.model");
const User = require("../models/User.model");

module.exports = {
  signup: async (req, res) => {
    const { email, passWord, name, phoneNumber } = req.body;
    console.log(
      `payme call [USER] >> [SIGNUP] payload ${JSON.stringify(req.body)}`
    );
    // LETS VALIDATE THE DATA BEFORE WE A USER
    var { error } = registerValidation(req.body);
    const response = {
      statusCode: 400,
      message: "Đăng ký tài khoản thất bại!",
      content: {
        email,
        passWord,
        name,
        phoneNumber
      }
    };

    if (error) {
        response.message = error.details[0].message;
        return res.send(response);
    }

    //Checking if the user is already in the database
    var emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
        response.message = "Email already exists";
        return res.send(response);
    }

    // Hash passwords
    var hashedPassword = await CryptoJS.SHA256(
      req.body.password + process.env.HASH_PASS_USER
    ).toString(CryptoJS.enc.Hex);

    var user = {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${req.body.name}`,
      phoneNumber: req.body.phoneNumber,
    };

    try {
      var saveUser = await User.create(user);
      console.log(
        `payme call [USER] >> [SIGNUP] response ${JSON.stringify(response)}`
      );
      response.code = 200;
      response.message = 'Đăng ký tài khoản thành công!'
      res.send(response);
    } catch (err) {
      console.log(err);
      response.code = 500;
      response.message = 'Internal Server Error'
      res.send(response);
    }
  },

  login: async (req, res) => {
    // LETS VALIDATE THE DATA BEFORE WE A USER
    var { error } = loginValidation(req.body);
    if (error) return res.send({ code: "400", msg: error.details[0].message });

    // Checking if the username exist
    var user = await UserModel.getUserByUsername(req.body.username);
    if (!user) return res.send({ code: "400", msg: "Username is wrong!" });

    // PASSWORD IS CORRECT
    var hashedPassword = await CryptoJS.SHA256(
      req.body.password + process.env.HASH_PASS_USER
    ).toString(CryptoJS.enc.Hex);
    if (hashedPassword !== user.password)
      return res.send({ code: "400", msg: "Invalid password" });

    // Create and assign a token
    var accessToken = await signAccessToken(String(user._id));
    var refreshToken = await signRefreshToken(String(user._id));

    res
      .header("authorization", accessToken)
      .send({ code: "200", msg: { accessToken, refreshToken } });
  },

  refreshToken: async (req, res) => {
    try {
      var { refreshToken } = req.body;
      // if (!refreshToken) throw createError.BadRequest();
      if (!refreshToken) throw "400";

      var checkTokenDb = await TokenModel.getTokenByRefreshToken(refreshToken);
      if (!checkTokenDb) throw "403";

      var userId = await verifyRefreshToken(refreshToken);
      var accessToken = await signAccessToken(userId);
      // var refreshToken = await signRefreshToken(userId);
      res
        .header("authorization", accessToken)
        .send({ code: "200", msg: { accessToken } });
    } catch (err) {
      if (err === "400") {
        res.send({ code: "400", msg: "No Refresh Token" });
      } else if (err === "403") {
        res.send({ code: "403", msg: "Forbidden" });
      } else {
        res.send({ code: "500", msg: err });
      }
    }
  },

  logout: async (req, res, next) => {
    try {
      var { refreshToken } = req.body;
      if (!refreshToken) throw "400";

      var userId = await verifyRefreshToken(refreshToken);

      // delete refresh token
      var a = await TokenModel.getTokenByIdUser(userId);
      var arr = a.value.filter((ref) => ref !== refreshToken);
      await TokenModel.updateTokenByIdUser(userId, { value: arr });
      // var deleteToken = await TokenModel.deleteTokenByUserId(userId);
      // console.log(userId);
      // console.log(deleteToken);
      res.send({ code: "200", msg: "success" });
    } catch (error) {
      if (error === "400") {
        res.send({ code: "400", msg: "No Refresh Token" });
      } else if (error === "403") {
        res.send({ code: "403", msg: "Forbidden" });
      } else {
        res.send({ code: "500", msg: error });
      }
    }
  },
};
