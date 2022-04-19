// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const {
	createValidation
} = require('../validations/taskType.validation');

const TaskTypeModel = require('../models/TaskType.model');

module.exports = {
	getAll: async (req, res) => {
        const response = {
            statusCode: 400,
            message: 'Xử lý thất bại',
            content: null
        };
		try {
			console.log(`[TASKTYPE] >> [GET ALL] payload`);

			let taskTypeAll = await TaskTypeModel.find();
            taskTypeAll = taskTypeAll.map((item, index) => {
                return {
                    id: item.id,
                    taskType: item.taskType
                }
            })

			response.statusCode = 200;
			response.message = 'Lấy danh sách task type thành công!';
            response.content = taskTypeAll;
			console.log(
				`[TASKTYPE] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR TASKTYPE] [GET ALL] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	create: async (req, res) => {
		const { taskType } = req.body;
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(
				`[TASKTYPE] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			var { error } = createValidation(req.body);

			if (error) {
				console.log(
					`[ERROR TASKTYPE] [CREATE] `,
					JSON.stringify(error)
				);
				response.message = error.details[0].message;
				return res.send(response);
			}

			const taskTypeExist = await TaskTypeModel.findOne({
				taskType
			});
			if (taskTypeExist) {
				console.log(
					'[ERROR TASKTYPE] [CREATE] Task type đã được sử dụng!'
				);
				response.message = 'Task type đã được sử dụng!';
				return res.send(response);
			}

			const saveTaskType = await TaskTypeModel.create({
				taskType
			});
			response.statusCode = 200;
			response.message = 'Tạo thành công!';
			console.log(
				`[TASKTYPE] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR TASKTYPE] [CREATE] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	}
};
