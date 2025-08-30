const path = require('path');
const { ethers } = require('ethers');
const SubsidyModel = require('../models/subsidy.model');
const ProducerModel = require('../models/producer.model');

async function fetchAllSubsidies(req, res) {
	const subsidies = await SubsidyModel.find({ producer: req.params.id });
	return res.json({ success: true, data: subsidies });
}

async function getSubsidyMilestones(req, res) {
	const { subsidyId } = req.params;

	const subsidy = await SubsidyModel.findById(subsidyId);
	return res.json({ success: true, data: subsidy.milestones });
}

async function submitMilestone(req, res) {
	const { subsidyId } = req.params;
	const { milestone, description } = req.body;

	if (req.file) {
		const file = { url: process.env.LIVE_URL + req.file.path.slice(7) };
	}

	// 🔗 Here call backend API to upload form data & files

	return res.json({ success: true, message: 'Milestone submitted successfully' });
}

module.exports = {
	fetchAllSubsidies,
	getSubsidyMilestones,
	submitMilestone,
};
