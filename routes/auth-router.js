const express = require('express');
const authRouter = express.Router();
const AuthController = require('../controllers/authController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

authRouter.post('/register', AuthController.validateRegistration(), AuthController.register);
authRouter.post('/login', AuthController.validateLogin(), AuthController.login);
authRouter.post('/logout', authMiddleware, AuthController.logout);
authRouter.post('/password-reset', AuthController.validateReminder(), AuthController.emailResetToken);
authRouter.post('/password-reset/:confirm_token', AuthController.isValidPassword(), AuthController.resetPass);
authRouter.post('/account-activation/:confirm_token', AuthController.accountActivation);
authRouter.post('/refresh', authMiddleware, AuthController.refreshJWT);

module.exports = authRouter;