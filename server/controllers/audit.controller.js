const SubsidyModel = require('../models/subsidy.model');
const MilestoneModel = require('../models/milestoneSubmission.model');

async function fetchAllSubsidies(req, res) {
	const subsidies = await SubsidyModel.find().populate('producer');
	const setSubsidies = subsidies.map((subsidy) => {
		return {
			id: subsidy._id,
			contractName: subsidy.title,
			projectName: subsidy.milestones[0].description,
			companyName: subsidy.producer.companyName,
			totalAmount: Number(subsidy.totalAmount) * 380000,
			status: subsidy.status,
		};
	});

	console.log(setSubsidies);
	return res.json({ success: true, data: setSubsidies });
}

async function fetchMilestoneLogs(req, res) {
	const { contractId } = req.params;
	const subsidy = await SubsidyModel.findById(contractId);
	const logs = await MilestoneModel.find({ subsidy: contractId });
	return res.json({ success: true, data: subsidy, logs: logs });
}

async function getAuditorDashboard(req, res) {
	try {
		const auditorId = req.params.id;
		console.log('audit', auditorId);

		// All subsidies assigned to this auditor
		const subsidies = await SubsidyModel.find({ auditor: auditorId });
		console.log(subsidies);
		let totalArrived = subsidies.length;

		let totalApproved = 0;
		let totalPending = 0;

		const monthMap = {}; // for audited subsidies per month (count)
		const statusMap = {}; // status per month (count)

		subsidies.forEach((sub) => {
			// Count approved/pending based on milestones
			sub.milestones.forEach((ms) => {
				if (ms.isReleased) totalApproved += 1;
				else totalPending += 1;

				const month = new Date(ms.releasedAt || sub.createdAt).toLocaleString('default', {
					month: 'short',
					year: 'numeric',
				});

				if (!monthMap[month]) monthMap[month] = 0;
				if (!statusMap[month])
					statusMap[month] = { Created: 0, Funded: 0, InProgress: 0, Completed: 0 };

				monthMap[month] += 1;
				statusMap[month][sub.status] += 1;
			});
		});

		// Convert monthMap to arrays for graphs
		const auditedPerMonth = Object.keys(monthMap)
			.sort((a, b) => new Date(a) - new Date(b))
			.map((month) => ({ month, total: monthMap[month] }));

		const statusPerMonth = Object.keys(statusMap)
			.sort((a, b) => new Date(a) - new Date(b))
			.map((month) => ({ month, ...statusMap[month] }));

		return res.json({
			success: true,
			cards: {
				totalArrived,
				totalApproved,
				totalPending,
			},
			graphs: {
				auditedPerMonth,
				statusPerMonth,
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: 'Server error' });
	}
}

module.exports = {
	fetchAllSubsidies,
	fetchMilestoneLogs,
	getAuditorDashboard,
};
