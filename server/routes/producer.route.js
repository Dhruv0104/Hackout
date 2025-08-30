const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multer.utils');
const producerController = require('../controllers/producer.controller');
const { asyncRouteHandler } = require('../utils/route.utils');

router.get('/fetch-all-subsidies/:id', asyncRouteHandler(producerController.fetchAllSubsidies));
router.get(
	'/subsidy-milestones/:subsidyId',
	asyncRouteHandler(producerController.getSubsidyMilestones)
);
router.post(
	'/submit-milestone/:subsidyId',
	upload.single('file'),
	asyncRouteHandler(producerController.submitMilestone)
);
router.get('/dashboard/:id', asyncRouteHandler(producerController.getProducerDashboard));

module.exports = router;
