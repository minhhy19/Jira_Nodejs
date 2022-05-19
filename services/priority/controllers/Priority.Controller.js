// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const logger = require('../../../loggerService');
const {
	createValidation
} = require('../validations/priority.validation');
const { removeUnicode } = require('../helpers/removeUnicode');

const PriorityModel = require('../models/Priority.model');

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
			logInfo('[PRIORITY] >> [GET ALL]');

			let priorityAll = await PriorityModel.find();
			priorityAll = priorityAll.map((item) => ({
				priorityId: item.priorityId,
				priority: item.priority,
				description: item.description,
				deleted: item.deleted,
				alias: item.alias
			}));

			response.statusCode = 200;
			response.message = 'Get all priority successfully!';
			response.content = priorityAll;
			logInfo(
				`[PRIORITY] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PRIORITY] [GET ALL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	create: async (req, res) => {
		const { priority } = req.body;
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PRIORITY] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = createValidation(req.body);

			if (error) {
				logInfo(`[ERROR PRIORITY] [CREATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Checking if the priority is already in the database
			const priorityExist = await PriorityModel.findOne({
				priority
			});
			if (priorityExist) {
				logInfo(
					'[ERROR PRIORITY] [CREATE] Priority already exists!'
				);
				response.message = 'Priority already exists!';
				return res.status(response.statusCode).send(response);
			}

			const savePriority = await PriorityModel.create({
				priority,
				description: priority,
				alias: removeUnicode(priority)
			});
			response.statusCode = 200;
			response.message = 'Create priority successfully';
			logInfo(
				`[PRIORITY] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PRIORITY] [CREATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	}
};
