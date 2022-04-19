const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		taskType: {
			type: String,
			required: true
		}
	},
	{
		collection: 'TaskType',
		versionKey: false,
		timestamps: true
	}
);

Schema.index({ taskType: 1 });

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
