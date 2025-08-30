const path = require('path');
const { ethers } = require('ethers');
const SubsidyModel = require('../models/subsidy.model');
const ProducerModel = require('../models/producer.model');
const MilestoneSubmission = require('../models/milestoneSubmission.model');

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
	try {
		const { subsidyId } = req.params;
		const { milestone, description, producerId } = req.body;

		let fileUrl = null;
		if (req.file) {
			fileUrl = process.env.LIVE_URL + req.file.path.slice(7);
		}

		const subsidy = await SubsidyModel.findById(subsidyId);

		if (!subsidy) {
			return res.status(404).json({ success: false, message: 'Subsidy not found' });
		}

		const submission = new MilestoneSubmission({
			subsidy: subsidyId,
			milestoneId: milestone,
			producer: producerId,
			auditor: subsidy.auditor,
			description,
			file: fileUrl,
		});

		await submission.save();

		return res.json({
			success: true,
			message: 'Milestone submitted successfully',
			data: submission,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: 'Server error', error });
	}
}

async function fetchMilestones(req, res) {
	const {id}=req.params;
	const subsidy = await SubsidyModel.findById(id);
	const submissions = await MilestoneSubmission.find({subsidy:id});
	return res.json({ success: true, data: submissions, subsidy: subsidy });
}

module.exports = {
	fetchAllSubsidies,
	getSubsidyMilestones,
	submitMilestone,
	fetchMilestones,
};
