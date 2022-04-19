// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const {
	createValidation
} = require('../validations/status.validation');

const StatusModel = require('../models/Status.model');

module.exports = {
	getAll: async (req, res) => {
        const response = {
            statusCode: 400,
            message: 'Xử lý thất bại',
            content: null
        };
		try {
			console.log(`[STATUS] >> [GET ALL] payload`);

			let statusAll = await StatusModel.find();
            statusAll = statusAll.map((item, index) => {
                return {
                    statusId: _.toString(item.statusId),
                    statusName: item.statusName,
					deleted: item.deleted,
					alias: item.alias
                }
            })

			response.statusCode = 200;
			response.message = 'Lấy danh sách status thành công!';
            response.content = statusAll;
			console.log(
				`[STATUS] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR STATUS] [GET ALL] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	create: async (req, res) => {
		const { statusName, alias } = req.body;
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(
				`[STATUS] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			var { error } = createValidation(req.body);

			if (error) {
				console.log(
					`[ERROR STATUS] [CREATE] `,
					JSON.stringify(error)
				);
				response.message = error.details[0].message;
				return res.send(response);
			}

			//Checking if the user is already in the database
			const statusExist = await StatusModel.findOne({
				statusName
			});
			if (statusExist) {
				console.log(
					'[ERROR STATUS] [CREATE] Tên status đã được sử dụng!'
				);
				response.message = 'Tên status đã được sử dụng!';
				return res.send(response);
			}

			const saveStatus = await StatusModel.create({
				statusName,
				alias
			});
			response.statusCode = 200;
			response.message = 'Tạo thành công!';
			console.log(
				`[STATUS] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR STATUS] [CREATE] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	}
};
