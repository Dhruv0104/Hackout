const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { asyncRouteHandler } = require('../utils/route.utils');

router.get('/fetch-all-subsidies', asyncRouteHandler(auditController.fetchAllSubsidies));
router.get('/fetch-milestone-logs/:contractId', asyncRouteHandler(auditController.fetchMilestoneLogs));
module.exports = router;