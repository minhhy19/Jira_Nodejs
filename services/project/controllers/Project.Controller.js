// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const {
	createValidation,
	createTaskValidation
} = require('../validations/project.validation');
const { removeUnicode } = require('../helpers/removeUnicode');
const ProjectModel = require('../models/Project.model');
const TaskModel = require('../models/Task.model');
const ProjectCategoryModel = require('../models/ProjectCategory.model');

const StatusModel = require('../../status/models/Status.model');
const TaskTypeModel = require('../../taskType/models/TaskType.model');
const PriorityModel = require('../../priority/models/Priority.model');
const UserModel = require('../../user/models/User.model');

module.exports = {
	getAll: async (req, res) => {
		const query = {
			...(req.query.keyword && { $text: { $search: req.query.keyword } })
		};
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(`[PROJECT] >> [GET ALL]`);

			let projectAll = await ProjectModel.find(query);
			projectAll = projectAll.map((project, index) => {
				return {
					members: project.members,
					creator: project.creator,
					id: project.id,
					projectName: project.projectName,
					description: project.description,
					categoryId: project.projectCategory.id,
					categoryName: project.projectCategory.name,
					alias: project.alias,
					deleted: project.deleted
				};
			});

			response.statusCode = 200;
			response.message = 'Lấy danh sách project thành công!';
			response.content = projectAll;
			console.log(
				`[PROJECT] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR PROJECT] [GET ALL] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	getProjectDetail: async (req, res) => {
		const projectId = _.get(req, 'query.id', null);
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(`[PROJECT] >> [GET PROJECT DETAIL]`);
			
			if (projectId === null) {
				console.log('[ERROR PROJECT] [GET PROJECT DETAIL] Không tìm thấy project!');
				response.message = 'Không tìm thấy project!';
				return res.send(response);
			}

			let project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				console.log('[ERROR PROJECT] [GET PROJECT DETAIL] Không tìm thấy project!');
				response.message = 'Không tìm thấy project!';
				return res.send(response);
			}

			const getTaskByProjectId = await TaskModel.find({ projectId });

			const status = await StatusModel.find();

			const mappingStatusIdToTaskDetail = getTaskByProjectId.reduce((acc, cur) => {
				const taskDetail = _.pick(cur, ['priorityTask', 'taskTypeDetail', 'assigness', 'lstComment', 'taskId', 'taskName', 'alias', 'description', 'statusId', 'originalEstimate', 'timeTrackingSpent', 'timeTrackingRemaining', 'typeId', 'priorityId', 'projectId']);
				if(!acc[cur.statusId]) {
					acc[cur.statusId] = [
						taskDetail
					]
				} else {
					acc[cur.statusId] = [...acc[cur.statusId], taskDetail]
				}
				return acc;
			}, {});

			const lstTask = status.map((item, index) => {
				return {
					lstTaskDeTail: mappingStatusIdToTaskDetail[item.statusId] || [],
					statusId: item.statusId,
					statusName: item.statusName,
					alias: item.alias
				}
			});

			response.statusCode = 200;
			response.message = 'Lấy chi tiết project thành công!';
			response.content = {
				lstTask,
				..._.pick(project, ['members', 'creator', 'id', 'projectName', 'description', 'projectCategory', 'alias'])
			};
			console.log(
				`[PROJECT] >> [GET PROJECT DETAIL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(`[ERROR PROJECT] [GET PROJECT DETAIL] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

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
				console.log(
					'[ERROR PROJECT] [CREATE] Không tìm thấy project category!'
				);
				response.message = 'Không tìm thấy project category!';
				return res.send(response);
			}

			const creator = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

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
			response.message = 'Tạo project thành công!';
			response.content = {
				id: saveProject.id,
				projectName: saveProject.projectName,
				description: saveProject.description,
				categoryId: saveProject.projectCategory.id,
				alias: saveProject.alias,
				deleted: saveProject.deleted,
				creator: saveProject.creator.id

			}
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

	createTask: async (req, res) => {
		const {
			listUserAsign,
			taskName,
			description,
			statusId,
			originalEstimate,
			timeTrackingSpent,
			timeTrackingRemaining,
			projectId,
			typeId,
			priorityId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			console.log(
				`[PROJECT] >> [CREATE TASK] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			var { error } = createTaskValidation(req.body);

			if (error) {
				console.log(`[ERROR PROJECT] [CREATE TASK] `, JSON.stringify(error));
				response.message = error.details[0].message;
				return res.send(response);
			}

			//Checking if the task name is already in the database
			const taskNameExist = await TaskModel.findOne({ taskName });
			if (taskNameExist) {
				console.log('[ERROR PROJECT] [CREATE TASK] Tên task đã được sử dụng!');
				response.message = 'Tên task đã được sử dụng!';
				return res.send(response);
			}

			const creator = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				console.log('[ERROR PROJECT] [CREATE TASK] Không tìm thấy project!');
				response.message = 'Không tìm thấy project!';
				return res.send(response);
			}

			if (creator.id !== project.creator.id) {
				console.log('[ERROR PROJECT] [CREATE TASK] Không đủ quyền truy cập!!');
				response.message = 'Không đủ quyền truy cập!';
				return res.send(response);
			}

			const status = await StatusModel.findOne({ statusId });
			if (!status) {
				console.log('[ERROR PROJECT] [CREATE TASK] Không tìm thấy status!');
				response.message = 'Không tìm thấy status!';
				return res.send(response);
			}

			const taskType = await TaskTypeModel.findOne({ id: typeId });
			if (!taskType) {
				console.log('[ERROR PROJECT] [CREATE TASK] Không tìm thấy task type!');
				response.message = 'Không tìm thấy task type!';
				return res.send(response);
			}

			const priority = await PriorityModel.findOne({ priorityId });
			if (!priority) {
				console.log('[ERROR PROJECT] [CREATE TASK] Không tìm thấy priority!');
				response.message = 'Không tìm thấy priority!';
				return res.send(response);
			}

			const userAssign = await UserModel.find({
				userId: {
					$in: listUserAsign
				}
			});
			

			const assigness = userAssign.map((user, index) => {
				return {
					id: user.userId,
					avatar: user.avatar,
					name: user.name,
					alias: user.name
				}
			});


			const taskData = {
				priorityTask: _.pick(priority, ['priorityId', 'priority']),
				taskTypeDetail: _.pick(taskType, ['id', 'taskType']),
				assigness,
				taskName,
				alias: removeUnicode(taskName),
				description,
				statusId,
				originalEstimate,
				timeTrackingSpent,
				timeTrackingRemaining,
				typeId,
				priorityId,
				projectId
			}

			const saveTask = await TaskModel.create(taskData);
			if (_.get(saveTask, 'id', false) === false) {
				console.log('[ERROR PROJECT] [CREATE TASK] Tạo task không thành công!');
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Tạo task thành công!';
			response.content = {
				..._.pick(saveTask, ['taskId', 'taskName', 'alias', 'description', 'statusId','originalEstimate', 'timeTrackingSpent', 'timeTrackingRemaining', 'projectId', 'typeId', 'deleted', 'priorityId']),
				reporterId: creator.id
			}
			console.log(
				`[PROJECT] >> [CREATE TASK] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			console.log(err);
			console.log(`[ERROR PROJECT] [CREATE TASK] `, JSON.stringify(err));
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	}
};
