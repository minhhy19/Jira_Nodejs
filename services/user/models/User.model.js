const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			lowercase: true,
			unique: true
		},
		name: {
			type: String,
			required: true
		},
		phoneNumber: {
			type: String,
			required: true
		},
		avatar: {
			type: String,
			required: true
		},
		passWord: {
			type: String,
			required: true
		}
	},
	{
		collection: 'User',
		versionKey: false,
		timestamps: true
	}
);

Schema.index({ email: 1 });
Schema.index({ name: 'text', phoneNumber: 'text' });

/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: 'userId',
	startAt: 1,
	incrementBy: 1
});

// UserSchema.pre('save', async function (next) {
//   try {
//     /*
//     Here first checking if the document is new by using a helper of mongoose .isNew, therefore, this.isNew is true if document is new else false, and we only want to hash the password if its a new document, else  it will again hash the password if you save the document again by making some changes in other fields incase your document contains other fields.
//     */
//     if (this.isNew) {
//       const salt = await bcrypt.genSalt(10)
//       const hashedPassword = await bcrypt.hash(this.password, salt)
//       this.password = hashedPassword
//     }
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

// UserSchema.methods.isValidPassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password)
//   } catch (error) {
//     throw error
//   }
// }

module.exports = mongoose.model(Schema.options.collection, Schema);
