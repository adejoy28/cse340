const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const utilities = require('../utilities');

// Route to intentionally trigger a 500 error
router.get('/trigger-error', utilities.handleErrors(errorController.triggerError));

module.exports = router;