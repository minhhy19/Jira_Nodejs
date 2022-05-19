// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const logger = require('../../../loggerService');
const {
	createValidation
} = require('../validations/status.validation');

const StatusModel = require('../models/Status.model');

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
			logInfo('[STATUS] >> [GET ALL] payload');

			let statusAll = await StatusModel.find();
			statusAll = statusAll.map((item) => ({
				statusId: _.toString(item.statusId),
				statusName: item.statusName,
				deleted: item.deleted,
				alias: item.alias
			}));

			response.statusCode = 200;
			response.message = 'Get all status successfully!';
			response.content = statusAll;
			logInfo(
				`[STATUS] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR STATUS] [GET ALL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	create: async (req, res) => {
		const { statusName, alias } = req.body;
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[STATUS] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = createValidation(req.body);

			if (error) {
				logInfo(`[ERROR STATUS] [CREATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Checking if the user is already in the database
			const statusExist = await StatusModel.findOne({
				statusName
			});
			if (statusExist) {
				logInfo(
					'[ERROR STATUS] [CREATE] Status name already exists!'
				);
				response.message = 'Status name already exists!';
				return res.status(response.statusCode).send(response);
			}

			const saveStatus = await StatusModel.create({
				statusName,
				alias
			});
			response.statusCode = 200;
			response.message = 'Create status successfully!';
			logInfo(
				`[STATUS] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR STATUS] [CREATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	}
};
