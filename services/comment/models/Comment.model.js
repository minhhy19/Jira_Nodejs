const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const bcrypt = require('bcrypt');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		user: {
			type: Object,
			required: true
		},
		userId: {
			type: Number,
			required: true
		},
		taskId: {
			type: Number,
			required: true
		},
		contentComment: {
			type: String,
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
		collection: 'Comment',
		versionKey: false,
		timestamps: true
	}
);

/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model(Schema.options.collection, Schema);
