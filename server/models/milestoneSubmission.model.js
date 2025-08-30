const mongoose = require('mongoose');

const milestoneSubmissionSchema = new mongoose.Schema({
	subsidy: { type: mongoose.Schema.Types.ObjectId, ref: 'subsidies', required: true },
	milestoneId: { type: mongoose.Schema.Types.ObjectId, required: true },
	producer: { type: mongoose.Schema.Types.ObjectId, ref: 'producers', required: true },
	description: { type: String, required: true },
	file: { type: String },
	status: {
		type: String,
		enum: ['Submitted', 'Verified', 'Rejected'],
		default: 'Submitted',
	},
	auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'auditors' },
	verifiedAt: { type: Date },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('milestone_submissions', milestoneSubmissionSchema);
