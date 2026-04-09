const express = require('express');
const { triggerSOS, addEmergencyContact } = require('../controllers/emergencyController');

const emergencyRouter = express.Router();

emergencyRouter.post('/trigger', triggerSOS);
emergencyRouter.post('/contact', addEmergencyContact);

module.exports = emergencyRouter;
