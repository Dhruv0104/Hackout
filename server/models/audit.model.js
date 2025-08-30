const mongoose = require('mongoose');

const auditorSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true }, // store hashed password
	name: { type: String, required: true },
	organization: { type: String }, // ex. Third-party audit firm
	walletAddress: { type: String, required: true },
	privateKey: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('auditors', auditorSchema);
