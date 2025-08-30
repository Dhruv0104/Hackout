const SubsidyModel = require('../models/subsidy.model');


async function fetchAllSubsidies(req, res) {
    const subsidies= await SubsidyModel.find().populate('producer');
    const setSubsidies = subsidies.map((subsidy) => {
        return {
            id: subsidy._id,
            contractName: subsidy.title,
            projectName: subsidy.milestones[0].description,
            companyName: subsidy.producer.companyName,
            totalAmount: Number(subsidy.totalAmount)*380000,
            status: subsidy.status,
        }
    });

    console.log(setSubsidies);
    return res.json({ success: true, data: setSubsidies });
}

async function fetchMilestoneLogs(req,res){
    const { contractId } = req.params; 
    const subsidy = await SubsidyModel.findById(contractId);  
    return res.json({ success: true, data: subsidy });
}

module.exports = {
    fetchAllSubsidies,
    fetchMilestoneLogs,
};