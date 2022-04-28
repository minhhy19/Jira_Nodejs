const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		priority: {
			type: String,
			required: true
		},
		description: {
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
		collection: 'Priority',
		versionKey: false,
		timestamps: true
	}
);

Schema.index({ priority: 1 });

/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: 'priorityId',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model(Schema.options.collection, Schema);
