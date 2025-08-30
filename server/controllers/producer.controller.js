const path = require('path');
const { ethers } = require('ethers');
const SubsidyModel = require('../models/subsidy.model');
const ProducerModel = require('../models/producer.model');

async function fetchAllSubsidies(req, res) {
	const subsidies = await SubsidyModel.find({ producer: req.params.id });
	return res.json({ success: true, data: subsidies });
}

module.exports = {
	fetchAllSubsidies,
};
