const mongoose = require('mongoose');

const producerSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true }, // store hashed password
	companyName: { type: String, required: true },
	walletAddress: { type: String, required: true }, // blockchain wallet
	privateKey: { type: String, required: true }, // blockchain wallet
	contactPerson: { type: String },
	email: { type: String },
	phone: { type: String },
	createdAt: { type: Date, default: Date.now },
	isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('producers', producerSchema);
