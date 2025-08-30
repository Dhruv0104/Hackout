const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
	scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'subsidies' },
	actionBy: { type: String, enum: ['Government', 'Producer', 'Auditor'] },
	actionById: { type: mongoose.Schema.Types.ObjectId }, // stores the ID of who acted
	actionType: { type: String }, // e.g., "FundDeposited", "MilestoneCompleted", "AuditApproved", "FundsReleased"
	transactionHash: { type: String }, // blockchain tx hash
	timestamp: { type: Date, default: Date.now },
	isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('transactions', transactionSchema);
