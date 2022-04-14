// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const {
	createValidation
} = require('../validations/project.validation');
const { removeUnicode } = require('../../../helpers/removeUnicode')
const ProjectModel = require('../models/Project.model');
const ProjectCategoryModel = require('../models/ProjectCategory.model');

module.exports = {
	createProjectAuthorize: async (req, res) => {
		const { projectName, description, categoryId } = req.body;
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(`[PROJECT] >> [CREATE] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			var { error } = createValidation(req.body);

			if (error) {
				console.log(`[ERROR PROJECT] [CREATE] `, JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			//Checking if the user is already in the database
			const projectNameExist = await ProjectModel.findOne({ projectName });
			if (projectNameExist) {
				console.log('[ERROR PROJECT] [CREATE] Tên project đã được sử dụng!');
				response.message = 'Tên project đã được sử dụng!';
				return res.send(response);
			}

			const category = await ProjectCategoryModel.findOne({ id: categoryId });
			if (!category) {
				console.log('[ERROR PROJECT] [CREATE] Không tìm thấy project category!');
				response.message = 'Không tìm thấy project category!';
				return res.send(response);
			}

			const creator = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			}

			const project = {
				projectName,
				description,
				projectCategory: {
					id: category.id,
					name: category.projectCategoryName
				},
				alias: removeUnicode(projectName),
				creator
			};

			const saveProject = await ProjectModel.create(project);
			if (_.get(saveProject, 'id', false) === false) {
				console.log('[ERROR PROJECT] [CREATE] Tạo project không thành công!');
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Đăng ký tài khoản thành công!';
			console.log(`[PROJECT] >> [CREATE] response ${JSON.stringify(response)}`);
			return res.send(response);
		} catch (err) {
			console.log(err);
			console.log(`[ERROR PROJECT] [CREATE] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

};
