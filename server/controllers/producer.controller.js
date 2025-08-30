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

async function getProducerDashboard(req, res) {
	try {
		const producerId = req.params.id;

		const subsidies = await SubsidyModel.find({ producer: producerId });

		// ---- Cards ----
		const totalContracts = subsidies.length;
		const totalSubsidyApplied = subsidies.reduce((sum, s) => sum + s.totalAmount, 0);

		let totalPending = 0;
		let totalReceived = 0;

		subsidies.forEach((s) => {
			s.milestones.forEach((m) => {
				if (m.isReleased) {
					totalReceived += m.amount;
				} else {
					totalPending += m.amount;
				}
			});
		});

		// ---- Graphs ----
		// Group subsidy apply per month
		const subsidyApplyPerMonth = {};
		const statusPerMonth = {};
		const amountTrackPerMonth = {};

		subsidies.forEach((s) => {
			const month = s.createdAt.toLocaleString('default', { month: 'short' });
			subsidyApplyPerMonth[month] = (subsidyApplyPerMonth[month] || 0) + s.totalAmount;

			// Status count
			if (!statusPerMonth[month]) {
				statusPerMonth[month] = { Created: 0, Funded: 0, InProgress: 0, Completed: 0 };
			}
			statusPerMonth[month][s.status] += 1;

			// Released milestones
			s.milestones.forEach((m) => {
				if (m.isReleased && m.releasedAt) {
					const rMonth = m.releasedAt.toLocaleString('default', { month: 'short' });
					amountTrackPerMonth[rMonth] = (amountTrackPerMonth[rMonth] || 0) + m.amount;
				}
			});
		});

		// Convert to arrays for recharts
		const subsidyApplyArr = Object.keys(subsidyApplyPerMonth).map((month) => ({
			month,
			total: subsidyApplyPerMonth[month],
		}));

		const statusArr = Object.keys(statusPerMonth).map((month) => ({
			month,
			...statusPerMonth[month],
		}));

		const amountTrackArr = Object.keys(amountTrackPerMonth).map((month) => ({
			month,
			released: amountTrackPerMonth[month],
		}));

		return res.json({
			success: true,
			cards: {
				totalContracts,
				totalSubsidyApplied,
				totalPending,
				totalReceived,
			},
			graphs: {
				subsidyApplyArr,
				statusArr,
				amountTrackArr,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ success: false, message: 'Server error', error: err });
	}
}

module.exports = {
	fetchAllSubsidies,
	getSubsidyMilestones,
	submitMilestone,
	fetchMilestones,
	getProducerDashboard,
};
