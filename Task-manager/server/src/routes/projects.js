const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { permit } = require('../middleware/roles');

router.use(auth);

router.post('/', permit('Admin'), [body('title').notEmpty()], projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', permit('Admin'), projectController.updateProject);
router.delete('/:id', permit('Admin'), projectController.deleteProject);

module.exports = router;
