const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		members: [
			{
				type: Object,
				default: null
			}
		],
		creator: {
			type: Object,
			required: true
		},
		projectName: {
			type: String,
			required: true
		},
		description: {
			type: String,
			default: ''
		},
		projectCategory: {
			type: Object,
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
		collection: 'Project',
		versionKey: false,
		timestamps: true
	}
);

Schema.index({ projectName: 'text', alias: 'text' });

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
