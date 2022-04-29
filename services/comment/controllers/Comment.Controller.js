// var UserModel = require('../models/User.model.js');
const _ = require('lodash');
const logger = require('../../../loggerService');
const {
	insertCommentValidation, updateCommentValidation
} = require('../validations/comment.validation');
const { removeUnicode } = require('../helpers/removeUnicode');

const CommentModel = require('../models/Comment.model');
const TaskModel = require('../../project/models/Task.model');
const UserModel = require('../../user/models/User.model');

function logInfo(str) {
	console.log(str);
	logger.info(str);
}

module.exports = {
	getAll: async (req, res) => {
		const taskId = _.get(req, 'query.taskId', null);
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			logInfo('[COMMENT] >> [GET ALL]');

			if (taskId === null) {
				logInfo(
					'[ERROR COMMENT] [GET ALL] Không tìm thấy task!'
				);
				response.statusCode = 200;
				response.message = 'Lấy danh sách comment thành công!';
				response.content = [];
				return res.send(response);
			}

			let commentAll = await CommentModel.find({ taskId });
			commentAll = commentAll.map((item) => ({
				user: item.user,
				id: item.id,
				userId: item.userId,
				taskId: item.taskId,
				contentComment: item.contentComment,
				deleted: item.deleted,
				alias: item.alias
			}));

			response.statusCode = 200;
			response.message = 'Lấy danh sách comment thành công!';
			response.content = commentAll;
			logInfo(
				`[COMMENT] >> [GET ALL] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			logInfo(`[ERROR COMMENT] [GET ALL] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	insertComment: async (req, res) => {
		const { taskId, contentComment } = req.body;
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			logInfo(
				`[COMMENT] >> [CREATE] payload ${JSON.stringify(req.body)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = insertCommentValidation(req.body);

			if (error) {
				logInfo(`[ERROR COMMENT] [CREATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud)
			};

			const user = await UserModel.findOne({ userId: userAction.id });
			if (!user) {
				logInfo(
					'[ERROR COMMENT] [CREATE] Không tìm thấy user!'
				);
				response.message = 'Không tìm thấy user!';
				return res.send(response);
			}

			const task = await TaskModel.findOne({ taskId });
			if (!task) {
				logInfo(
					'[ERROR COMMENT] [CREATE] Không tìm thấy task!'
				);
				response.message = 'Không tìm thấy task!';
				return res.send(response);
			}

			const commentData = {
				user: _.pick(user, ['userId', 'name', 'avatar']),
				userId: user.userId,
				taskId,
				contentComment,
				alias: removeUnicode(contentComment)
			};

			const saveComment = await CommentModel.create(commentData);
			if (_.get(saveComment, 'id', false) === false) {
				logInfo('[ERROR COMMENT] [CREATE] Tạo comment không thành công!');
				return res.send(response);
			}

			// const updatedTask = await TaskModel.updateOne(
			// 	{ taskId },
			// 	{
			// 		$push: {
			// 			lstComment: {
			// 				id: saveComment.id,
			// 				userId: user.userId,
			// 				name: user.name,
			// 				avatar: user.avatar,
			// 				contentComment
			// 			}
			// 		}
			// 	}
			// );
			// if (!updatedTask) {
			// 	logInfo('[ERROR COMMENT] [CREATE] Cập nhật task không thành công!');
			// 	return res.send(response);
			// }

			response.statusCode = 200;
			response.message = 'Tạo thành công!';
			response.content = _.pick(saveComment, ['id', 'userId', 'taskId', 'contentComment', 'deleted', 'alias']);
			logInfo(
				`[COMMENT] >> [CREATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			logInfo(`[ERROR COMMENT] [CREATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	updateComment: async (req, res) => {
		const param = {
			id: _.get(req, 'query.id', null),
			contentComment: _.get(req, 'query.contentComment', null)
		};
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			logInfo(
				`[COMMENT] >> [UPDATE] payload ${JSON.stringify(param)}`
			);
			// LETS VALIDATE THE DATA
			const { error } = updateCommentValidation(param);

			if (error) {
				logInfo(`[ERROR COMMENT] [UPDATE] ${JSON.stringify(error)}`);
				response.message = error.details[0].message;
				return res.send(response);
			}

			const comment = await CommentModel.findOne({ id: param.id });
			if (!comment) {
				logInfo(
					'[ERROR COMMENT] [UPDATE] Không tìm thấy comment!'
				);
				response.message = 'Không tìm thấy comment!';
				return res.send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud)
			};

			if (userAction.id !== comment.userId) {
				logInfo(
					'[ERROR COMMENT] [UPDATE] 403 Forbidden !'
				);
				response.statusCode = 403;
				response.message = '403 Forbidden !';
				return res.status(403).send(response);
			}

			const user = await UserModel.findOne({ userId: userAction.id });
			if (!user) {
				logInfo(
					'[ERROR COMMENT] [UPDATE] Không tìm thấy user!'
				);
				response.message = 'Không tìm thấy user!';
				return res.send(response);
			}

			const commentDataUpdate = {
				user: _.pick(user, ['userId', 'name', 'avatar']),
				contentComment: param.contentComment,
				alias: removeUnicode(param.contentComment)
			};

			const updateComment = await CommentModel.findOneAndUpdate(
				{ id: comment.id },
				commentDataUpdate,
				{ new: true }
			);
			if (!_.isObject(updateComment) || !_.get(updateComment, 'id', false)) {
				logInfo(
					'[ERROR COMMENT] [UPDATE] Cập nhật comment không thành công!'
				);
				response.message = 'Cập nhật comment không thành công!';
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Cập nhật comment thành công!';
			response.content = _.pick(updateComment, ['id', 'userId', 'taskId', 'contentComment', 'deleted', 'alias']);
			logInfo(
				`[COMMENT] >> [UPDATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			logInfo(`[ERROR COMMENT] [UPDATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	},

	deleteComment: async (req, res) => {
		const id = _.get(req, 'query.idComment', null);
		const response = {
			statusCode: 400,
			message: 'Xử lý thất bại',
			content: null
		};
		try {
			logInfo('[COMMENT] >> [DELETE]');

			const comment = await CommentModel.findOne({ id });
			if (!comment) {
				logInfo(
					'[ERROR COMMENT] [DELETE] Không tìm thấy comment!'
				);
				response.message = 'Không tìm thấy comment!';
				return res.send(response);
			}

			const userAction = {
				id: _.toNumber(req.user.aud)
			};

			if (userAction.id !== comment.userId) {
				logInfo(
					'[ERROR COMMENT] [DELETE] 403 Forbidden !'
				);
				response.statusCode = 403;
				response.message = '403 Forbidden !';
				return res.status(403).send(response);
			}

			const user = await UserModel.findOne({ userId: userAction.id });
			if (!user) {
				logInfo(
					'[ERROR COMMENT] [DELETE] Không tìm thấy user!'
				);
				response.message = 'Không tìm thấy user!';
				return res.send(response);
			}

			const commentDeleted = await CommentModel.deleteOne({ id });
			if (!commentDeleted || commentDeleted.deletedCount < 1) {
				logInfo(
					'[ERROR COMMENT] [DELETE] Xóa comment thất bại, vui lòng thử lại'
				);
				response.message = 'Xóa comment thất bại, vui lòng thử lại';
				return res.send(response);
			}

			response.statusCode = 200;
			response.message = 'Deleted comment success';
			logInfo(
				`[COMMENT] >> [UPDATE] response ${JSON.stringify(response)}`
			);
			return res.send(response);
		} catch (err) {
			logInfo(`[ERROR COMMENT] [UPDATE] ${JSON.stringify(err)}`);
			response.statusCode = 500;
			response.message = 'Internal Server Error';
			return res.send(response);
		}
	}
};
