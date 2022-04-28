const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		statusName: {
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
		collection: 'Status',
		versionKey: false,
		timestamps: true
	}
);

Schema.index({ statusName: 1 });

/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: 'statusId',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model(Schema.options.collection, Schema);
