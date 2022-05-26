// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const logger = require('../../../loggerService');
const {
	createValidation,
	editValidation,
	createTaskValidation,
	assignUserProjectValidation,
	updateTaskValidation,
	assignUserTaskValidation,
	removeUserTaskValidation,
	updateStatusValidation,
	updatePriorityValidation,
	updateDescriptionValidation,
	updateTimeTrackingValidation,
	updateEstimateValidation
} = require('../validations/project.validation');
const { removeUnicode } = require('../helpers/removeUnicode');
const ProjectModel = require('../models/Project.model');
const TaskModel = require('../models/Task.model');
const ProjectCategoryModel = require('../models/ProjectCategory.model');

const StatusModel = require('../../status/models/Status.model');
const TaskTypeModel = require('../../taskType/models/TaskType.model');
const PriorityModel = require('../../priority/models/Priority.model');
const UserModel = require('../../user/models/User.model');
const CommentModel = require('../../comment/models/Comment.model');

function logInfo(str) {
	console.log(str);
	logger.info(str);
}

module.exports = {
	getAll: async (req, res) => {
		const query = {
			...(req.query.keyword && { $text: { $search: req.query.keyword } })
		};
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo('[PROJECT] >> [GET ALL]');

			let projectAll = await ProjectModel.find(query);
			projectAll = projectAll.map((project) => ({
				members: project.members,
				creator: project.creator,
				id: project.id,
				projectName: project.projectName,
				description: project.description,
				categoryId: project.projectCategory.id,
				categoryName: project.projectCategory.name,
				alias: project.alias,
				deleted: project.deleted
			}));

			response.statusCode = 200;
			response.message = 'Get all project successfully!';
			response.content = projectAll;
			logInfo(
				`[PROJECT] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [GET ALL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	getProjectDetail: async (req, res) => {
		const projectId = _.get(req, 'query.id', null);
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo('[PROJECT] >> [GET PROJECT DETAIL]');

			if (projectId === null) {
				logInfo(
					'[ERROR PROJECT] [GET PROJECT DETAIL] Project not found!'
				);
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				logInfo(
					'[ERROR PROJECT] [GET PROJECT DETAIL] Project not found!'
				);
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			const getTaskByProjectId = await TaskModel.find({ projectId });

			const status = await StatusModel.find();

			const mappingStatusIdToTaskDetail = getTaskByProjectId.reduce(
				(acc, cur) => {
					const taskDetail = _.pick(cur, [
						'priorityTask',
						'taskTypeDetail',
						'assigness',
						'lstComment',
						'taskId',
						'taskName',
						'alias',
						'description',
						'statusId',
						'originalEstimate',
						'timeTrackingSpent',
						'timeTrackingRemaining',
						'typeId',
						'priorityId',
						'projectId'
					]);
					if (!acc[cur.statusId]) {
						acc[cur.statusId] = [taskDetail];
					} else {
						acc[cur.statusId] = [...acc[cur.statusId], taskDetail];
					}
					return acc;
				},
				{}
			);

			const lstTask = status.map((item) => ({
				lstTaskDeTail: mappingStatusIdToTaskDetail[item.statusId] || [],
				statusId: item.statusId,
				statusName: item.statusName,
				alias: item.alias
			}));

			response.statusCode = 200;
			response.message = 'Get project detail succesfully!';
			response.content = {
				lstTask,
				..._.pick(project, [
					'members',
					'creator',
					'id',
					'projectName',
					'description',
					'projectCategory',
					'alias'
				])
			};
			logInfo(
				`[PROJECT] >> [GET PROJECT DETAIL] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [GET PROJECT DETAIL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	createProjectAuthorize: async (req, res) => {
		const { projectName, description, categoryId } = req.body;
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [CREATE] payload ${JSON.stringify(req.body)}`);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = createValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [CREATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Checking if the projectName is already in the database
			const projectNameExist = await ProjectModel.findOne({ projectName });
			if (projectNameExist) {
				logInfo('[ERROR PROJECT] [CREATE] Project name already exists!');
				response.message = 'Project name already exists!';
				return res.status(response.statusCode).send(response);
			}

			const category = await ProjectCategoryModel.findOne({ id: categoryId });
			if (!category) {
				logInfo(
					'[ERROR PROJECT] [CREATE] Project category not found!'
				);
				response.message = 'Project category not found!';
				return res.status(response.statusCode).send(response);
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
				logInfo('[ERROR PROJECT] [CREATE] Save project failed!');
				response.message = 'Save project failed!';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Create project successfully!';
			response.content = {
				id: saveProject.id,
				projectName: saveProject.projectName,
				description: saveProject.description,
				categoryId: saveProject.projectCategory.id,
				alias: saveProject.alias,
				deleted: saveProject.deleted,
				creator: saveProject.creator.id
			};
			logInfo(`[PROJECT] >> [CREATE] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [CREATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updateProject: async (req, res) => {
		const projectId = _.get(req, 'query.projectId', null);
		const {
			projectName, creator, description, categoryId
		} = req.body;
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [EDIT] payload ${JSON.stringify(req.body)}`);
			if (projectId === null) {
				logInfo('[ERROR PROJECT] [EDIT] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			// LETS VALIDATE THE DATA
			const { error } = editValidation(req.body);
			if (error) {
				logInfo(`[ERROR PROJECT] [EDIT] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [EDIT] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			// Checking if the projectName is already in the database
			const projectNameExist = await ProjectModel.findOne({
				projectName,
				id: { $ne: project.id }
			});
			if (projectNameExist) {
				logInfo('[ERROR PROJECT] [EDIT] Project name already exists!');
				response.message = 'Project name already exists!';
				return res.status(response.statusCode).send(response);
			}

			const category = await ProjectCategoryModel.findOne({ id: categoryId });
			if (!category) {
				logInfo('[ERROR PROJECT] [EDIT] Project category not found!');
				response.message = 'Project category not found!';
				return res.status(response.statusCode).send(response);
			}

			const projectDataEdit = {
				projectName,
				description,
				projectCategory: {
					id: category.id,
					name: category.projectCategoryName
				},
				alias: removeUnicode(projectName)
			};

			// trường hợp creator của project trong db với user token là 1 ng thì cho update creator
			const user = await UserModel.findOne({ userId: creator });
			if (project.creator.id === _.toNumber(req.user.aud) && _.get(user, 'userId', false)) {
				projectDataEdit.creator = {
					id: user.userId,
					name: user.name
				};
			}

			const updateProject = await ProjectModel.findOneAndUpdate(
				{ id: projectId },
				projectDataEdit,
				{ new: true }
			);

			if (!_.isObject(updateProject) || !_.get(updateProject, 'id', false)) {
				logInfo(
					'[ERROR PROJECT] [EDIT] Edit project failed!'
				);
				response.message = 'Edit project failed!';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Edit project successfully!';
			response.content = {
				id: updateProject.id,
				projectName: updateProject.projectName,
				description: updateProject.description,
				categoryId: updateProject.projectCategory.id,
				alias: updateProject.alias,
				deleted: updateProject.deleted,
				creator: updateProject.creator.id
			};
			logInfo(`[PROJECT] >> [EDIT] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(err);
			logInfo(`[ERROR PROJECT] [EDIT] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	deleteProject: async (req, res) => {
		const projectId = _.get(req, 'query.projectId', null);

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [DELETE] payload ${JSON.stringify(req.body)}`);
			if (projectId === null) {
				logInfo('[ERROR PROJECT] [DELETE] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			const projectExist = await ProjectModel.findOne({ id: projectId });
			if (!projectExist) {
				logInfo('[ERROR PROJECT] [DELETE] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			// if (_.toNumber(req.user.aud) !== projectExist.creator.id) {
			// 	logInfo('[ERROR PROJECT] [DELETE] User is unthorization!!');
			// 	response.message = 'User is unthorization!';
			// 	return res.status(response.statusCode).send(response);
			// }

			const tasksDeleted = await TaskModel.deleteMany({ projectId });
			if (!tasksDeleted) {
				logInfo(
					'[ERROR PROJECT] [DELETE PROJECT] Delete project failed, please try again'
				);
				response.message = 'Delete project failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			const projectDeleted = await ProjectModel.deleteOne({ id: projectId });
			if (!projectDeleted || projectDeleted.deletedCount < 1) {
				logInfo(
					'[ERROR PROJECT] [DELETE PROJECT] Delete project failed, please try again'
				);
				response.message = 'Delete project failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Delete project successfully!';
			logInfo(`[PROJECT] >> [DELETE] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [DELETE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	assignUserProject: async (req, res) => {
		const {
			projectId, userId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [ASSIGN USER PROJECT] payload ${JSON.stringify(req.body)}`);
			const { error } = assignUserProjectValidation(req.body);
			if (error) {
				logInfo(`[ERROR PROJECT] [ASSIGN USER PROJECT] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [ASSIGN USER PROJECT] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			if (_.toNumber(req.user.aud) !== project.creator.id) {
				logInfo('[ERROR PROJECT] [ASSIGN USER PROJECT] User is unthorization!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const user = await UserModel.findOne({ userId });
			if (!user) {
				logInfo('[ERROR PROJECT] [ASSIGN USER PROJECT] User not found!');
				response.message = 'User not found!';
				return res.status(response.statusCode).send(response);
			}

			const arrMemberIdInProject = project.members.map((mem) => (mem.userId));

			if (_.includes(arrMemberIdInProject, user.userId)) {
				logInfo('[ERROR PROJECT] [ASSIGN USER PROJECT] User already exists in the project!');
				response.message = 'User already exists in the project!';
				return res.status(response.statusCode).send(response);
			}

			const userAssignToProject = _.pick(user, ['userId', 'name', 'avatar', 'email', 'phoneNumber']);

			const assignUserToProject = await ProjectModel.updateOne({ id: projectId }, {
				$push: {
					members: userAssignToProject
				}
			});

			if (!assignUserToProject) {
				logInfo('[ERROR PROJECT] [ASSIGN USER PROJECT] Update failed, please try again');
				response.message = 'Update failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Has added the user to the project !';
			logInfo(`[PROJECT] >> [ASSIGN USER PROJECT] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [ASSIGN USER PROJECT] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	removeUserFromProject: async (req, res) => {
		const {
			projectId, userId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [REMOVE USER PROJECT] payload ${JSON.stringify(req.body)}`);
			const { error } = assignUserProjectValidation(req.body);
			if (error) {
				logInfo(`[ERROR PROJECT] [REMOVE USER PROJECT] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [REMOVE USER PROJECT] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			if (_.toNumber(req.user.aud) !== project.creator.id) {
				logInfo('[ERROR PROJECT] [REMOVE USER PROJECT] User is unthorization!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const user = await UserModel.findOne({ userId });
			if (!user) {
				logInfo('[ERROR PROJECT] [REMOVE USER PROJECT] User not found!');
				response.message = 'User not found!';
				return res.status(response.statusCode).send(response);
			}

			const arrMemberRemoved = project.members.filter((mem) => mem.userId !== userId);

			const removeUserFromProject = await ProjectModel.updateOne({ id: projectId }, {
				members: arrMemberRemoved
			});

			if (!removeUserFromProject) {
				logInfo('[ERROR PROJECT] [REMOVE USER PROJECT] Update failed, please try again');
				response.message = 'Update failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Remove user from project successfully !';
			logInfo(`[PROJECT] >> [REMOVE USER PROJECT] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [REMOVE USER PROJECT] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
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
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [CREATE TASK] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = createTaskValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [CREATE TASK] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			// Checking if the task name is already in the database
			const taskNameExist = await TaskModel.findOne({ taskName });
			if (taskNameExist) {
				logInfo('[ERROR PROJECT] [CREATE TASK] Task name already exists!');
				response.message = 'Task name already exists!';
				return res.status(response.statusCode).send(response);
			}

			const creator = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [CREATE TASK] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			if (creator.id !== project.creator.id) {
				logInfo('[ERROR PROJECT] [CREATE TASK] User is unthorization!!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const status = await StatusModel.findOne({ statusId });
			if (!status) {
				logInfo('[ERROR PROJECT] [CREATE TASK] Status not found!');
				response.message = 'Status not found!';
				return res.status(response.statusCode).send(response);
			}

			const taskType = await TaskTypeModel.findOne({ id: typeId });
			if (!taskType) {
				logInfo('[ERROR PROJECT] [CREATE TASK] Task type not found!');
				response.message = 'Task type not found!';
				return res.status(response.statusCode).send(response);
			}

			const priority = await PriorityModel.findOne({ priorityId });
			if (!priority) {
				logInfo('[ERROR PROJECT] [CREATE TASK] Priority not found!');
				response.message = 'Priority not found!';
				return res.status(response.statusCode).send(response);
			}

			const userAssign = await UserModel.find({
				userId: {
					$in: listUserAsign
				}
			});

			const assigness = userAssign.map((user) => ({
				id: user.userId,
				avatar: user.avatar,
				name: user.name,
				alias: user.name
			}));

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
			};

			const saveTask = await TaskModel.create(taskData);
			if (_.get(saveTask, 'id', false) === false) {
				logInfo('[ERROR PROJECT] [CREATE TASK] Save task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Create task successfully!';
			response.content = {
				..._.pick(saveTask, [
					'taskId',
					'taskName',
					'alias',
					'description',
					'statusId',
					'originalEstimate',
					'timeTrackingSpent',
					'timeTrackingRemaining',
					'projectId',
					'typeId',
					'deleted',
					'priorityId'
				]),
				reporterId: creator.id
			};
			logInfo(
				`[PROJECT] >> [CREATE TASK] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [CREATE TASK] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updateTask: async (req, res) => {
		const {
			listUserAsign,
			taskId,
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
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [UPDATE TASK] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA BEFORE WE A USER
			const { error } = updateTaskValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [UPDATE TASK] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			// Checking if the task name is already in the database
			const taskNameExist = await TaskModel.findOne({
				taskName,
				taskId: { $ne: task.taskId }
			});
			if (taskNameExist) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Task name already exists!');
				response.message = 'Task name already exists!';
				return res.status(response.statusCode).send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			const project = await ProjectModel.findOne({ id: projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			if (userAction.id !== project.creator.id) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] User is unthorization!!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const status = await StatusModel.findOne({ statusId });
			if (!status) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Status not found!');
				response.message = 'Status not found!';
				return res.status(response.statusCode).send(response);
			}

			const taskType = await TaskTypeModel.findOne({ id: typeId });
			if (!taskType) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Task type not found!');
				response.message = 'Task type not found!';
				return res.status(response.statusCode).send(response);
			}

			const priority = await PriorityModel.findOne({ priorityId });
			if (!priority) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Priority not found!');
				response.message = 'Priority not found!';
				return res.status(response.statusCode).send(response);
			}

			const userAssign = await UserModel.find({
				userId: {
					$in: listUserAsign
				}
			});

			const assigness = userAssign.map((user) => ({
				id: user.userId,
				avatar: user.avatar,
				name: user.name,
				alias: user.name
			}));

			const taskDataUpdate = {
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
			};

			const updateTask = await TaskModel.findOneAndUpdate(
				{ taskId },
				taskDataUpdate,
				{ new: true }
			);
			if (!_.isObject(updateTask) || !_.get(updateTask, 'id', false)) {
				logInfo('[ERROR PROJECT] [UPDATE TASK] Update task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update task successfully';
			response.content = {
				..._.pick(updateTask, [
					'taskId',
					'taskName',
					'alias',
					'description',
					'statusId',
					'originalEstimate',
					'timeTrackingSpent',
					'timeTrackingRemaining',
					'projectId',
					'typeId',
					'deleted',
					'priorityId'
				]),
				reporterId: userAction.id
			};
			logInfo(
				`[PROJECT] >> [UPDATE TASK] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [UPDATE TASK] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	getTaskDetail: async (req, res) => {
		const taskId = _.get(req, 'query.taskId', null);
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo('[PROJECT] >> [GET TASK DETAIL]');

			if (taskId === null) {
				logInfo(
					'[ERROR PROJECT] [GET TASK DETAIL] Task not found!'
				);
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const getListCommentByTaskId = await CommentModel.find({ taskId }).sort({ createdAt: -1 });
			const lstComment = getListCommentByTaskId.map((item) => ({
				id: item.id,
				idUser: item.userId,
				name: item.user.name,
				avatar: item.user.avatar,
				commentContent: item.contentComment,
				createdAt: item.createdAt
			}));

			const taskDetail = await TaskModel.findOne({ taskId });
			if (!taskDetail) {
				logInfo(
					'[ERROR PROJECT] [GET TASK DETAIL] Task not found!'
				);
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Get task detail successfully!';
			response.content = {
				lstComment,
				..._.pick(taskDetail, [
					'priorityTask',
					'taskTypeDetail',
					'assigness',
					'taskId',
					'taskName',
					'alias',
					'description',
					'statusId',
					'originalEstimate',
					'timeTrackingSpent',
					'timeTrackingRemaining',
					'typeId',
					'priorityId',
					'projectId',
					'createdAt',
					'updatedAt'
				])
			};
			logInfo(
				`[PROJECT] >> [GET TASK DETAIL] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [GET TASK DETAIL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	removeTask: async (req, res) => {
		const taskId = _.get(req, 'query.taskId', null);
		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo('[PROJECT] >> [REMOVE TASK]');

			const userAction = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			if (taskId === null) {
				logInfo(
					'[ERROR PROJECT] [REMOVE TASK] Task not found!'
				);
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo(
					'[ERROR PROJECT] [REMOVE TASK] Task not found!'
				);
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: task.projectId });
			if (userAction.id !== project.creator.id) {
				logInfo('[ERROR PROJECT] [REMOVE TASK] User is unthorization!!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const conmentsDeleted = await CommentModel.deleteMany({ taskId });
			if (!conmentsDeleted) {
				logInfo(
					'[ERROR PROJECT] [REMOVE TASK] Delete task failed, please try again'
				);
				response.message = 'Delete task failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			const taskDeleted = await TaskModel.deleteOne({ taskId });
			if (!taskDeleted || taskDeleted.deletedCount < 1) {
				logInfo(
					'[ERROR PROJECT] [REMOVE TASK] Delete task failed, please try again'
				);
				response.message = 'Delete task failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Delete task successfully!';
			logInfo(
				`[PROJECT] >> [REMOVE TASK] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [REMOVE TASK] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	assignUserTask: async (req, res) => {
		const {
			taskId, userId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [ASSIGN USER TASK] payload ${JSON.stringify(req.body)}`);
			const { error } = assignUserTaskValidation(req.body);
			if (error) {
				logInfo(`[ERROR PROJECT] [ASSIGN USER TASK] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [ASSIGN USER TASK] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: task.projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [ASSIGN USER TASK] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			if (_.toNumber(req.user.aud) !== project.creator.id) {
				logInfo('[ERROR PROJECT] [ASSIGN USER TASK] User is unthorization!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const user = await UserModel.findOne({ userId });
			if (!user) {
				logInfo('[ERROR PROJECT] [ASSIGN USER TASK] User not found!');
				response.message = 'User not found!';
				return res.status(response.statusCode).send(response);
			}

			const arrAssignessIdInTask = task.assigness.map((mem) => (mem.id));

			if (_.includes(arrAssignessIdInTask, userId)) {
				logInfo('[ERROR PROJECT] [ASSIGN USER TASK] User already assign in the task!');
				response.message = 'User already assign in the task!';
				return res.status(response.statusCode).send(response);
			}

			const userAssignToTask = {
				id: user.userId,
				..._.pick(user, ['avatar', 'name']),
				alias: user.name
			};

			const assignUserToTask = await TaskModel.updateOne({ taskId }, {
				$push: {
					assigness: userAssignToTask
				}
			});

			if (!assignUserToTask) {
				logInfo('[ERROR PROJECT] [ASSIGN USER TASK] Update failed, please try again');
				response.message = 'Update failed, please try again';
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Has added the user to the task !';
			logInfo(`[PROJECT] >> [ASSIGN USER TASK] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [ASSIGN USER TASK] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	removeUserFromTask: async (req, res) => {
		const {
			taskId, userId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(`[PROJECT] >> [REMOVE USER TASK] payload ${JSON.stringify(req.body)}`);
			const { error } = removeUserTaskValidation(req.body);
			if (error) {
				logInfo(`[ERROR PROJECT] [REMOVE USER TASK] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [REMOVE USER TASK] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const project = await ProjectModel.findOne({ id: task.projectId });
			if (!project) {
				logInfo('[ERROR PROJECT] [REMOVE USER TASK] Project not found!');
				response.message = 'Project not found!';
				return res.status(response.statusCode).send(response);
			}

			if (_.toNumber(req.user.aud) !== project.creator.id) {
				logInfo('[ERROR PROJECT] [REMOVE USER TASK] User is unthorization!');
				response.message = 'User is unthorization!';
				return res.status(response.statusCode).send(response);
			}

			const user = await UserModel.findOne({ userId });
			if (!user) {
				logInfo('[ERROR PROJECT] [REMOVE USER TASK] User not found!');
				response.message = 'User not found!';
				return res.status(response.statusCode).send(response);
			}
			const arrMemberRemoved = task.assigness.filter((mem) => mem.id !== userId);

			const removeUserFromTask = await TaskModel.updateOne({ taskId }, {
				assigness: arrMemberRemoved
			});

			response.statusCode = 200;
			response.message = 'Remove user from task successfully!';
			logInfo(`[PROJECT] >> [REMOVE USER TASK] response ${JSON.stringify(response)}`);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [REMOVE USER TASK] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updateStatus: async (req, res) => {
		const {
			taskId,
			statusId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [UPDATE STATUS] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = updateStatusValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [UPDATE STATUS] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [UPDATE STATUS] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const status = await StatusModel.findOne({ statusId });
			if (!status) {
				logInfo('[ERROR PROJECT] [UPDATE STATUS] Status not found!');
				response.message = 'Status not found!';
				return res.status(response.statusCode).send(response);
			}

			const updateTask = await TaskModel.findOneAndUpdate(
				{ taskId },
				{ statusId: _.toString(statusId) },
				{ new: true }
			);
			if (!_.isObject(updateTask) || !_.get(updateTask, 'id', false)) {
				logInfo('[ERROR PROJECT] [UPDATE STATUS] Update task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update task successfully!';
			logInfo(
				`[PROJECT] >> [UPDATE STATUS] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [UPDATE STATUS] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updatePriority: async (req, res) => {
		const {
			taskId,
			priorityId
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [UPDATE PRIORITY] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = updatePriorityValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [UPDATE PRIORITY] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [UPDATE PRIORITY] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			// check user thực hiện api đã được assign trong task chưa
			const arrUserAssignTask = task.assigness.map((user) => user.id);
			if (!_.includes(arrUserAssignTask, userAction.id)) {
				logInfo('[ERROR PROJECT] [UPDATE PRIORITY] User is not assign!');
				response.message = 'User is not assign!';
				return res.status(response.statusCode).send(response);
			}

			const priority = await PriorityModel.findOne({ priorityId });
			if (!priority) {
				logInfo('[ERROR PROJECT] [UPDATE PRIORITY] Priority not found!');
				response.message = 'Priority not found!';
				return res.status(response.statusCode).send(response);
			}

			const updateTask = await TaskModel.findOneAndUpdate(
				{ taskId },
				{ priorityId },
				{ new: true }
			);
			if (!_.isObject(updateTask) || !_.get(updateTask, 'id', false)) {
				logInfo('[ERROR PROJECT] [UPDATE PRIORITY] Update task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update task successfully!';
			logInfo(
				`[PROJECT] >> [UPDATE PRIORITY] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [UPDATE PRIORITY] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updateDescription: async (req, res) => {
		const {
			taskId,
			description
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [UPDATE DESCRIPTION] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = updateDescriptionValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [UPDATE DESCRIPTION] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [UPDATE DESCRIPTION] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			// check user thực hiện api đã được assign trong task chưa
			const arrUserAssignTask = task.assigness.map((user) => user.id);
			if (!_.includes(arrUserAssignTask, userAction.id)) {
				logInfo('[ERROR PROJECT] [UPDATE DESCRIPTION] User is not assign!');
				response.message = 'User is not assign!';
				return res.status(response.statusCode).send(response);
			}

			const updateTask = await TaskModel.findOneAndUpdate(
				{ taskId },
				{ description },
				{ new: true }
			);
			if (!_.isObject(updateTask) || !_.get(updateTask, 'id', false)) {
				logInfo('[ERROR PROJECT] [UPDATE DESCRIPTION] Update task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update task successfully!';
			logInfo(
				`[PROJECT] >> [UPDATE DESCRIPTION] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [UPDATE DESCRIPTION] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updateTimeTracking: async (req, res) => {
		const {
			taskId,
			timeTrackingSpent,
			timeTrackingRemaining
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [UPDATE TIME TRACKING] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = updateTimeTrackingValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [UPDATE TIME TRACKING] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [UPDATE TIME TRACKING] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			// check user thực hiện api đã được assign trong task chưa
			const arrUserAssignTask = task.assigness.map((user) => user.id);
			if (!_.includes(arrUserAssignTask, userAction.id)) {
				logInfo('[ERROR PROJECT] [UPDATE TIME TRACKING] User is not assign!');
				response.message = 'User is not assign!';
				return res.status(response.statusCode).send(response);
			}

			const updateTask = await TaskModel.findOneAndUpdate(
				{ taskId },
				{ timeTrackingSpent, timeTrackingRemaining },
				{ new: true }
			);
			if (!_.isObject(updateTask) || !_.get(updateTask, 'id', false)) {
				logInfo('[ERROR PROJECT] [UPDATE TIME TRACKING] Update task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update task successfully!';
			logInfo(
				`[PROJECT] >> [UPDATE TIME TRACKING] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [UPDATE TIME TRACKING] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	},

	updateEstimate: async (req, res) => {
		const {
			taskId,
			originalEstimate
		} = req.body;

		const response = {
			statusCode: 400,
			message: 'Request failed',
			content: null
		};
		try {
			logInfo(
				`[PROJECT] >> [UPDATE ESTIMATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = updateEstimateValidation(req.body);

			if (error) {
				logInfo(`[ERROR PROJECT] [UPDATE ESTIMATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.status(response.statusCode).send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo('[ERROR PROJECT] [UPDATE ESTIMATE] Task not found!');
				response.message = 'Task not found!';
				return res.status(response.statusCode).send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud),
				name: req.user.name
			};

			// check user thực hiện api đã được assign trong task chưa
			const arrUserAssignTask = task.assigness.map((user) => user.id);
			if (!_.includes(arrUserAssignTask, userAction.id)) {
				logInfo('[ERROR PROJECT] [UPDATE ESTIMATE] User is not assign!');
				response.message = 'User is not assign!';
				return res.status(response.statusCode).send(response);
			}

			const updateTask = await TaskModel.findOneAndUpdate(
				{ taskId },
				{ originalEstimate },
				{ new: true }
			);
			if (!_.isObject(updateTask) || !_.get(updateTask, 'id', false)) {
				logInfo('[ERROR PROJECT] [UPDATE ESTIMATE] Update task failed!');
				return res.status(response.statusCode).send(response);
			}

			response.statusCode = 200;
			response.message = 'Update task successfully!';
			logInfo(
				`[PROJECT] >> [UPDATE ESTIMATE] response ${JSON.stringify(response)}`
			);
			return res.status(response.statusCode).send(response);
		} catch (err) {
			logInfo(`[ERROR PROJECT] [UPDATE ESTIMATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.status(response.statusCode).send(response);
		}
	}
};
