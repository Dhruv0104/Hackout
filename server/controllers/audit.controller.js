const SubsidyModel = require('../models/subsidy.model');
const MilestoneModel = require('../models/milestoneSubmission.model');
const { ethers } = require('ethers');

const SubsidyContract = require('../../hackout-contract/artifacts/contracts/Subsidy.sol/Subsidy.json');
const artifact = SubsidyContract;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

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

async function releaseMilestone(req, res) {
	try {
		const { contractId, milestoneIndex } = req.body;

		if (!contractId || milestoneIndex === undefined) {
			return res
				.status(400)
				.json({ success: false, message: 'Missing contractId or milestoneIndex' });
		}

		const contract1 = await SubsidyModel.findById(contractId)
			.select('contractAddress')
			.lean()
			.exec();
		const contractAddress = contract1.contractAddress;

		// Load contract
		const contract = new ethers.Contract(contractAddress, artifact.abi, wallet);

		// Call releaseMilestone
		const tx = await contract.releaseMilestone(milestoneIndex);
		const receipt = await tx.wait();

		// Update in DB
		const subsidy = await SubsidyModel.findOne({ contractAddress });
		if (!subsidy) {
			return res.status(404).json({ success: false, message: 'Subsidy record not found' });
		}

		if (subsidy.milestones[milestoneIndex]) {
			subsidy.milestones[milestoneIndex].isReleased = true;
			subsidy.milestones[milestoneIndex].releasedAt = new Date();
		}

		// If all milestones released, mark contract complete
		const allReleased = subsidy.milestones.every((m) => m.isReleased);
		if (allReleased) subsidy.status = 'Completed';

		await subsidy.save();

		await MilestoneModel.updateMany(
			{ subsidy: subsidy._id },
			{ $set: { status: 'Verified', verifiedAt: new Date() } }
		);

		return res.status(200).json({
			success: true,
			message: `Milestone ${milestoneIndex} released`,
			txHash: receipt.transactionHash,
			subsidy,
		});
	} catch (err) {
		console.error('Release Milestone Error:', err);
		return res.status(500).json({ success: false, message: err.message });
	}
}

async function rejectByAudit(req, res) {
	try {
		const { subsidyId, auditorId, reason } = req.body;
		console.log(req.body);

		if (!subsidyId || !auditorId || !reason) {
			return res.status(400).json({
				success: false,
				message: 'subsidyId, auditorId and reason are required',
			});
		}

		// Fetch subsidy
		const subsidy = await SubsidyModel.findById(subsidyId);
		if (!subsidy) {
			return res.status(404).json({ success: false, message: 'Subsidy not found' });
		}

		// Check auditor match
		if (subsidy.auditor.toString() !== auditorId) {
			return res.status(403).json({ success: false, message: 'Not authorized auditor' });
		}

		// Update status
		subsidy.status = 'Rejected';
		// subsidy.rejectionReason = reason;
		subsidy.rejectedAt = new Date();

		await subsidy.save();

		await MilestoneModel.updateMany(
			{ subsidy: subsidy._id },
			{ $set: { status: 'Rejected', verifiedAt: new Date() } }
		);

		return res.status(200).json({
			success: true,
			message: 'Subsidy contract rejected by audit',
			subsidy,
		});
	} catch (err) {
		console.error('RejectByAudit Error:', err);
		return res.status(500).json({ success: false, message: err.message });
	}
}

module.exports = {
	fetchAllSubsidies,
	fetchMilestoneLogs,
	getAuditorDashboard,
	releaseMilestone,
	rejectByAudit,
};
