const express = require('express');
const router = express.Router();
const producerController = require('../controllers/producer.controller');
const { asyncRouteHandler } = require('../utils/route.utils');

router.get('/fetch-all-subsidies/:id', asyncRouteHandler(producerController.fetchAllSubsidies));

module.exports = router;
