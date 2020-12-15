const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	acl: [
		{
			type: Number,
			required: true,
		},
	],
});

const Permission = mongoose.model('Permission', PermissionSchema);

module.exports = { Permission };
