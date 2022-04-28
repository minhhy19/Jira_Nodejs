const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		priorityTask: {
			type: Object,
			required: true
		},
		taskTypeDetail: {
			type: Object,
			required: true
		},
		assigness: [
			{
				type: Object,
				default: null
			}
		],
		lstComment: [
			{
				type: Object,
				default: null
			}
		],
		taskName: {
			type: String,
			required: true
		},
		description: {
			type: String,
			default: ''
		},
		statusId: {
			type: String,
			required: true
		},
		originalEstimate: {
			type: Number,
			required: true
		},
		timeTrackingSpent: {
			type: Number,
			required: true
		},
		timeTrackingRemaining: {
			type: Number,
			required: true
		},
		typeId: {
			type: Number,
			required: true
		},
		priorityId: {
			type: Number,
			required: true
		},
		projectId: {
			type: Number,
			required: true
		},
		alias: {
			type: String,
			required: true
		},
		deleted: {
			type: Boolean,
			default: false
		}
	},
	{
		collection: 'Task',
		versionKey: false,
		timestamps: true
	}
);

Schema.index({ projectCategoryName: 1 });

/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: 'taskId',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model(Schema.options.collection, Schema);
