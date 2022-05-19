// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const logger = require('../../../loggerService');
const { createValidation } = require('../validations/taskType.validation');

const TaskTypeModel = require('../models/TaskType.model');

function logInfo(str) {
	console.log(str);
	logger.info(str);
}

module.exports = {
	getAll: async (req, res) => {
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo('[TASKTYPE] >> [GET ALL]');

			let taskTypeAll = await TaskTypeModel.find();
			taskTypeAll = taskTypeAll.map((item) => ({
				id: item.id,
				taskType: item.taskType
			}));

			response.statusCode = 200;
			response.message = 'Get all task type successfully!';
			response.content = taskTypeAll;
			logInfo(
				`[TASKTYPE] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR TASKTYPE] [GET ALL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	create: async (req, res) => {
		const { taskType } = req.body;
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[TASKTYPE] >> [CREATE] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = createValidation(req.body);

			if (error) {
				logInfo(`[ERROR TASKTYPE] [CREATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const taskTypeExist = await TaskTypeModel.findOne({
				taskType
			});
			if (taskTypeExist) {
				logInfo('[ERROR TASKTYPE] [CREATE] Task type name already exists!');
				response.message = 'Task type name already exists!';
				return res.status(response.statusCode).send(response);
			}

			const saveTaskType = await TaskTypeModel.create({
				taskType
			});
			response.statusCode = 200;
			response.message = 'Create task type successfully!';
			logInfo(
				`[TASKTYPE] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR TASKTYPE] [CREATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	}
};
