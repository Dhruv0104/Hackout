const path = require('path');
const { ethers } = require('ethers');
const SubsidyModel = require('../models/subsidy.model');
const ProducerModel = require('../models/producer.model');
const GovernmentModel = require('../models/government.model'); // if you have it
const MilestoneSubmission = require('../models/milestoneSubmission.model');
// const AuditorModel = require("../models/auditor.model"); // optional

// Load compiled ABI + bytecode
// Adjust path according to your folder structure
const SubsidyContract = require('../../hackout-contract/artifacts/contracts/Subsidy.sol/Subsidy.json');
const artifact = SubsidyContract;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// GET /api/subsidy/producers
async function fetchAllProducers(req, res) {
	const producers = await ProducerModel.find({ isActive: true });
	return res.json({ success: true, data: producers });
}

// POST /api/subsidy/create
// Body: { title, description, governmentId, producerId, totalAmountEth, milestones: [{description, amountEth}, ...] }
async function createContract(req, res) {
	try {
		const { contractName, totalAmount, milestones } = req.body;
		const producer1 = req.body.producer;
		console.log(req.body);

		if (!contractName || !producer1 || !totalAmount || !Array.isArray(milestones)) {
			return res.status(400).json({ success: false, message: 'Missing required fields' });
		}

		// Fetch producer to get walletAddress
		const producer = await ProducerModel.findById(producer1._id);
		if (!producer)
			return res.status(404).json({ success: false, message: 'Producer not found' });

		// (Optional) fetch/verify government record too
		// const government = await GovernmentModel.findById(governmentId);
		// if (!government) return res.status(404).json({ success: false, message: "Government not found" });

		// Validate sums: totalAmountEth equals sum(milestones.amountEth)
		const sumMilestones = milestones.reduce((acc, m) => acc + Number(m.amount || 0), 0);
		if (Number(totalAmount) !== sumMilestones) {
			return res.status(400).json({
				success: false,
				message: `totalAmount (${totalAmount}) must equal sum of milestones (${sumMilestones})`,
			});
		}

		// Deploy the contract with producer wallet and pre-fund escrow with totalAmount
		const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
		const valueWei = ethers.parseEther(String(totalAmount)); // fund escrow in constructor
		const contract = await factory.deploy(producer1.walletAddress, { value: valueWei });
		const receipt = await contract.deploymentTransaction().wait();

		const contractAddress = await contract.getAddress();
		const deployTxHash = receipt.hash;

		// After deployment, add each milestone on-chain
		for (const m of milestones) {
			const tx = await contract.addMilestone(
				m.description,
				ethers.parseEther(String(m.amount))
			);
			await tx.wait();
		}

		// Save in DB
		const subsidyDoc = await SubsidyModel.create({
			title: contractName,
			government: '66d0f1111111111111111111',
			auditor: '66d0f2222222222222222222',
			producer: producer1._id,
			totalAmount: Number(totalAmount), // store ETH amount for demo
			milestones: milestones.map((m) => ({
				description: m.description,
				amount: Number(m.amount),
				isReleased: false,
				releasedAt: null,
			})),
			contractAddress,
			status: 'InProgress', // since escrow funded at deploy
			isActive: true,
		});

		return res.status(201).json({
			success: true,
			message: 'Subsidy contract deployed & funded',
			contractAddress,
			deployTxHash,
			subsidy: subsidyDoc,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: err.message });
	}
}

// POST /api/subsidy/release
// Body: { schemeId, milestoneIndex }
async function releaseMilestone(req, res) {
	try {
		const { schemeId, milestoneIndex } = req.body;
		const scheme = await SubsidyModel.findById(schemeId);
		if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

		const contract = new ethers.Contract(scheme.contractAddress, artifact.abi, wallet);
		const tx = await contract.releaseMilestone(Number(milestoneIndex));
		const receipt = await tx.wait();

		// Update DB
		scheme.milestones[milestoneIndex].isReleased = true;
		scheme.milestones[milestoneIndex].releasedAt = new Date();
		// If all released -> mark completed
		const allReleased = scheme.milestones.every((m) => m.isReleased);
		scheme.status = allReleased ? 'Completed' : 'InProgress';
		await scheme.save();

		return res.json({
			success: true,
			message: `Milestone ${milestoneIndex} released`,
			txHash: receipt.hash,
			scheme,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: err.message });
	}
}

async function fetchActiveContracts(req, res) {
	try {
		const contracts = await SubsidyModel.find({ isActive: true })
			.populate('producer')
			.populate('government');
		return res.json({ success: true, data: contracts });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: err.message });
	}
}

async function fetchMilestones(req, res) {
	const {id}=req.params;
	const subsidy = await SubsidyModel.findById(id);
	const submissions = await MilestoneSubmission.find({subsidy:id});
	return res.json({ success: true, data: submissions, subsidy: subsidy });
}

async function dashboard(req, res) {
	try {
		const subsidyCount = await SubsidyModel.countDocuments();
		const producerCount = await ProducerModel.countDocuments();
		const totalSubsidyCompleted = await SubsidyModel.countDocuments({ status: 'Completed' });
		const producers = await ProducerModel.find();
		let totalAmountDisbursed = ethers.toBigInt(0);
		for (const p of producers) {
			if (p.walletAddress) {
				const bal = await provider.getBalance(p.walletAddress);
				totalAmountDisbursed += bal;
			}
		}
		const governmentAddress = '0x102fa63eCEF7fcE38a9259AE9B7789b46AEE88e2';
		const currentAmount = await provider.getBalance(governmentAddress);
		const subsidies = await SubsidyModel.find({ isActive: true });
		let totalPendingAmount = ethers.toBigInt(0);
		for (const s of subsidies) {
			if (s.contractAddress) {
				const bal = await provider.getBalance(s.contractAddress);
				totalPendingAmount += bal;
			}
		}

		// --- Chart 1: Total amount allocated vs distributed per month ---
		const amountPerMonth = await SubsidyModel.aggregate([
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
					},
					totalAllocated: { $sum: '$totalAmount' },
					totalDistributed: {
						$sum: {
							$sum: {
								$map: {
									input: '$milestones',
									as: 'm',
									in: {
										$cond: ['$$m.isReleased', '$$m.amount', 0],
									},
								},
							},
						},
					},
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1 } },
		]);

		// --- Chart 2: Contract status distribution (pie chart) ---
		const statusDistribution = await SubsidyModel.aggregate([
			{ $match: { status: { $in: ['InProgress', 'Completed'] } } },
			{ $group: { _id: '$status', count: { $sum: 1 } } },
		]);

		// --- Chart 3: Total subsidy allocated per month ---
		const subsidyAllocatedPerMonth = await SubsidyModel.aggregate([
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
					},
					totalAllocated: { $sum: '$totalAmount' },
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1 } },
		]);

		// --- Chart 4: Number of producers applying for subsidy per month ---
		const producersPerMonth = await SubsidyModel.aggregate([
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
					},
					producers: { $addToSet: '$producer' },
				},
			},
			{
				$project: {
					_id: 1,
					count: { $size: '$producers' },
				},
			},
			{ $sort: { '_id.year': 1, '_id.month': 1 } },
		]);

		return res.json({
			success: true,
			data: {
				subsidyCount,
				producerCount,
				totalSubsidyCompleted,
				totalAmountDisbursed: ethers.formatEther(totalAmountDisbursed),
				currentAmount: ethers.formatEther(currentAmount),
				totalPendingAmount: ethers.formatEther(totalPendingAmount),
				charts: {
					amountPerMonth,
					statusDistribution,
					subsidyAllocatedPerMonth,
					producersPerMonth,
				},
			},
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, message: err.message });
	}
}

module.exports = {
	fetchAllProducers,
	createContract,
	releaseMilestone,
	fetchActiveContracts,
	dashboard,
	fetchMilestones,
};
