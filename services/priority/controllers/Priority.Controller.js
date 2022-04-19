// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const {
	createValidation
} = require('../validations/priority.validation');
const { removeUnicode } = require('../helpers/removeUnicode')

const PriorityModel = require('../models/Priority.model');

module.exports = {
	getAll: async (req, res) => {
        const response = {
            statusCode: 400,
            message: 'Xử lý thất bại',
            content: null
        };
		try {
			console.log(`[PRIORITY] >> [GET ALL] payload`);

			let priorityAll = await PriorityModel.find();
            priorityAll = priorityAll.map((item, index) => {
                return {
                    priorityId: item.priorityId,
                    priority: item.priority,
					description: item.description,
					deleted: item.deleted,
					alias: item.alias
                }
            })
            console.log('priorityAll', priorityAll);

			response.statusCode = 200;
			response.message = 'Lấy danh sách priority thành công!';
            response.content = priorityAll;
			console.log(
				`[PRIORITY] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR PRIORITY] [GET ALL] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	create: async (req, res) => {
		const { priority } = req.body;
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(
				`[PRIORITY] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			var { error } = createValidation(req.body);

			if (error) {
				console.log(
					`[ERROR PRIORITY] [CREATE] `,
					JSON.stringify(error)
				);
				response.message = error.details[0].message;
				return res.send(response);
			}

			//Checking if the user is already in the database
			const priorityExist = await PriorityModel.findOne({
				priority
			});
			if (priorityExist) {
				console.log(
					'[ERROR PRIORITY] [CREATE] Priority đã được sử dụng!'
				);
				response.message = 'Priority đã được sử dụng!';
				return res.send(response);
			}

			const savePriority = await PriorityModel.create({
				priority,
				description: priority,
				alias: removeUnicode(priority)
			});
			response.statusCode = 200;
			response.message = 'Tạo thành công!';
			console.log(
				`[PRIORITY] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR PRIORITY] [CREATE] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	}
};
