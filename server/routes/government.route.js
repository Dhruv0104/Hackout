const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/government.controller');
const { asyncRouteHandler } = require('../utils/route.utils');

router.get('/fetch-all-producers', asyncRouteHandler(governmentController.fetchAllProducers));
router.post('/create-contract', asyncRouteHandler(governmentController.createContract));
router.get('/fetch-active-contracts', asyncRouteHandler(governmentController.fetchActiveContracts));
router.get('/dashboard', asyncRouteHandler(governmentController.dashboard));
router.get('/fetch-milestones/:id', asyncRouteHandler(governmentController.fetchMilestones));

module.exports = router;
