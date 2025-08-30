const path = require('path');
const { ethers } = require('ethers');
const SubsidyModel = require('../models/subsidy.model');
const ProducerModel = require('../models/producer.model');
const GovernmentModel = require('../models/government.model'); // if you have it
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

module.exports = {
	fetchAllProducers,
	createContract,
	releaseMilestone,
	fetchActiveContracts,
};
