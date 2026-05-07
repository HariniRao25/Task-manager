const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');
const usersController = require('../controllers/usersController');

router.use(auth);
router.get('/', permit('Admin'), usersController.listUsers);

module.exports = router;
