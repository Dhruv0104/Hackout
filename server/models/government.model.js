const mongoose = require('mongoose');

const governmentSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true }, // store hashed password
	department: { type: String }, // optional, e.g., "Ministry of Renewable Energy"
	walletAddress: { type: String, required: true }, // blockchain wallet
	privateKey: { type: String, required: true }, // blockchain wallet
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('governments', governmentSchema);
