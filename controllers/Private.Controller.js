var UserModel = require('../models/User.model.js');
module.exports = {
    private: async (req, res) => {
        var user = await UserModel.getUserById(req.user.aud);
        res.send({code: '200', msg: {name: user.name, id: user._id}});
    }
}