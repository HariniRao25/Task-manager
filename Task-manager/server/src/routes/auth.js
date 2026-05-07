const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

router.post(
  '/signup',
  [
    body('name').trim().notEmpty(),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.signup
);

router.post('/login', [body('email').trim().isEmail().normalizeEmail(), body('password').exists()], authController.login);

module.exports = router;
