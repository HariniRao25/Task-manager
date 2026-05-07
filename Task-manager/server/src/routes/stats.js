const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const statsController = require('../controllers/statsController');

router.use(auth);
router.get('/summary', statsController.getSummary);

module.exports = router;
