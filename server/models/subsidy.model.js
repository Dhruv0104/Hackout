const mongoose = require('mongoose');

const subsidySchemeSchema = new mongoose.Schema({
	title: { type: String, required: true }, // Scheme name
	description: { type: String },
	government: { type: mongoose.Schema.Types.ObjectId, ref: 'governments', required: true },
	producer: { type: mongoose.Schema.Types.ObjectId, ref: 'producers', required: true },
	auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'auditors' }, // optional
	totalAmount: { type: Number, required: true },
	milestones: [
		{
			description: String,
			amount: Number,
			isReleased: { type: Boolean, default: false },
			releasedAt: { type: Date },
		},
	],
	contractAddress: { type: String }, // blockchain smart contract address
	status: {
		type: String,
		enum: ['Created', 'Funded', 'InProgress', 'Completed'],
		default: 'Created',
	},
	createdAt: { type: Date, default: Date.now },
	isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('subsidies', subsidySchemeSchema);
