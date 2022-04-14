var UserModel = require('../models/User.model.js');
const User = require('../models/User.model');

module.exports = {
    private: async (req, res) => {
        console.log('req.body', req.body);
        var user = await User.findOne({userId: req.user.aud});
        res.send({code: '200', msg: user});
    }
}