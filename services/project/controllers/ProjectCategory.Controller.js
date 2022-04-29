// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const logger = require('../../../loggerService');
const {
	createProjectCategoryValidation
} = require('../validations/projectCategory.validation');

const ProjectCategoryModel = require('../models/ProjectCategory.model');

function logInfo(str) {
	console.log(str);
	logger.info(str);
}

module.exports = {
	getAllCategory: async (req, res) => {
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			logInfo('[PROJECT CATEGORY] >> [GET ALL] payload');

			let projectCategoryAll = await ProjectCategoryModel.find();
			projectCategoryAll = projectCategoryAll.map((category) => ({
				id: category.id,
				projectCategoryName: category.projectCategoryName
			}));

			response.statusCode = 200;
			response.message = 'Lấy danh sách project category thành công!';
			response.content = projectCategoryAll;
			logInfo(
				`[PROJECT CATEGORY] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT CATEGORY] [GET ALL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	createProjectCategory: async (req, res) => {
		const { projectCategoryName } = req.body;
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			logInfo(
				`[PROJECT CATEGORY] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = createProjectCategoryValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT CATEGORY] [CREATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.send(response);
			}

			// Checking if the user is already in the database
			const projectCategoryNameExist = await ProjectCategoryModel.findOne({
				projectCategoryName
			});
			if (projectCategoryNameExist) {
				logInfo(
					'[ERROR PROJECT] [CREATE] Tên project category đã được sử dụng!'
				);
				response.message = 'Tên project category đã được sử dụng!';
				return res.send(response);
			}

			const saveProjectCategory = await ProjectCategoryModel.create({
				projectCategoryName
			});
			response.statusCode = 200;
			response.message = 'Tạo thành công!';
			logInfo(
				`[PROJECT CATEGORY] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT CATEGORY] [CREATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	}
};
