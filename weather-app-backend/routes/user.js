const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validation');
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');

const registerSchema = Joi.object({ name: Joi.string().allow(''), email: Joi.string().email().required(), password: Joi.string().min(6).required() });
const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });

router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.get('/me', requireAuth, userController.me);

module.exports = router;
