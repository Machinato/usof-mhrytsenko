const { check, validationResult } = require('express-validator');
const User = require("../models/user.js");
const Token = require("../models/token.js");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {SECRET_ACCESS, SECRET_REFRESH} = require('../config.json');
const { sendResponse, hashPassword } = require('../service/helperFunction.js');
const WebToken = require('../models/jwt.js');
const MailService = require('../service/mail-service.js');
const uuid = require('uuid');
const JWToken = require('../models/jwt.js');

const generateTokens = (id, roles) => {
    const payload = {
        id,
        roles
    }

    const accessToken = jwt.sign(payload, SECRET_ACCESS, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, SECRET_REFRESH, { expiresIn: "30d" });

    return {
        accessToken,
        refreshToken
    }
}

const validateAccessToken = (token) => {
    try{
        const userData = jwt.verify(token, SECRET_ACCESS)
        return userData
    }
    catch (err){
        console.log(err)
        return null;
    }
}

const validateRefreshToken = (token) => {
    try{
        const userData = jwt.verify(token, SECRET_REFRESH)
        return userData
    }
    catch (err){
        console.log(err)
        return null;
    }
}

class authController {
    static async register(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }

        try {
            const hashedPassword = await hashPassword(req.body.password);
            let user = new User({ ...req.body, password: hashedPassword, role: 'user'});

            let r = await user.save();

            if (r === true) {
                const activaionLink = uuid.v4();
                const expiration_date = new Date(Date.now() + 2592000000);
                await Token.addTokenToDB(user.id, activaionLink, expiration_date);

                MailService.sandMail(`<h3>Your account activation link: ${activaionLink}</h3>`, user.email_address, "Activation link");

                const tokens = generateTokens(user.id, user.role);
                await WebToken.saveToken(user.id, tokens.refreshToken);
                const userLikeObject = user.getLikeObject()

                res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

                return sendResponse(res, 201, true, "User registered successfully", { userLikeObject, tokens, activaionLink });
            } else {
                return sendResponse(res, 500, false, "Registration failed");
            }
        } catch (err) {
            console.error('Error in register:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async login(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }

        let user = new User(req.body);
        const userBylogin = await user.findByProperty('login', user.login);
        // const userByEmail = await user.findByProperty('email_address', user.email_address);

        try {
            if (userBylogin && user.email_address === req.body.email_address) {
                const match = await bcrypt.compare(req.body.password, user.password);
                // console.log('Stored hashed password:', user.password);
                // console.log('Match:', match);
                if (match) {
                    console.log(`userId = ${user.id}`)
                    const tokens = generateTokens(user.id, user.role);
                    const saveTokenResult = await WebToken.saveToken(user.id, tokens.refreshToken);
                    console.log(`saveTokenResult = ${saveTokenResult}`)
                    const userLikeObject = user.getLikeObject()
                    res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

                    return sendResponse(res, 200, true, "User logged in", { tokens: tokens, user: userLikeObject });
                }
                else {
                    return sendResponse(res, 401, false, `The passwords don't match`);
                }
            } else {
                return sendResponse(res, 404, false, `User with login ${user.login} not found or wrong email`);
            }
        } catch (err) {
            console.error('Error in login:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async logout(req, res) {
        
        try {
            const { refreshToken } = req.cookies;
            // console.log(refreshToken);
            const newJWToken = new WebToken({});
            console.log(refreshToken);
            const result = await newJWToken.findByProperty("token", refreshToken);
            console.log(`result = ${result}`);
            // console.log(`res = ${findRes}`);
            // console.log(newJWToken.getLikeObject());
    
            if(!result){
                return sendResponse(res, 401, true, "User has not authorized");
            }
    
            const delResult = await newJWToken.delete();
            if (delResult) {
                res.clearCookie('refreshToken');
                return sendResponse(res, 200, true, "User logged out");
            } else {
                return sendResponse(res, 401, false, "You're not logged in");
            }
        }
        catch (err) {
            console.error('Error in logout:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
        
    }

    static async emailResetToken(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }

        let user = new User(req.body);
        try {
            if (await user.findByProperty("email_address", req.body.email_address)) {
                const token = crypto.randomBytes(32).toString('hex');
                const expiration_date = new Date(Date.now() + 600000);

                const resetLink = `http://localhost:3000/api/auth/password-reset/${token}`;
                await Token.addTokenToDB(user.id, token, expiration_date);
                
                const result = await MailService.sandMail(`Hello, ${user.login}. Follow this link to change your password: <a href="${resetLink}">${resetLink}</a>`, user.email_address, "Password reminder");

                // console.log('step 4th');
                console.log(result);

                return sendResponse(res, 201, true, "Password reset email sent", { token });
            } else {
                return sendResponse(res, 404, false, "User not found with this email");
            }
        } catch (err) {
            console.error('Error in emailResetToken:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async resetPass(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }

        const { confirm_token } = req.params;
        const { new_password } = req.body;

        try {
            const foundId = await Token.userId(confirm_token);
            if (await Token.findUserByTokenAndTermCheck(confirm_token)) {
                let user = new User({});
                console.log(`foundId = ${foundId}`);
                const userExists = await user.findByProperty("id", foundId);
                console.log(`userExists = ${userExists}`);
                if (userExists) {
                    user.password = await hashPassword(new_password);
                    const { _tableName, _fields, db, ...userData } = user;
                    await User.updateById(user.id, userData);

                    Token.delete(foundId);
                    return sendResponse(res, 200, true, "Password changed successfully");
                } else {
                    return sendResponse(res, 404, false, "User not found");
                }

            } else {
                if (foundId) {
                    Token.delete(foundId);
                    return sendResponse(res, 401, false, "Invalid token");
                }
                return sendResponse(res, 400, false, "Token expired or invalid");
            }
        }
        catch (err) {
            console.error('Error in reset password:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async accountActivation(req, res) {
        const { confirm_token } = req.params;
        try {
            const foundId = await Token.userId(confirm_token);
            if (await Token.findUserByTokenAndTermCheck(confirm_token)) {
                let user = new User({});
                console.log(`foundId = ${foundId}`);
                const userExists = await user.findByProperty("id", foundId);
                console.log(`userExists = ${userExists}`);
                if (userExists) {
                    user.is_activated = true;
                    await User.updateById(user.id, user.getLikeObject());

                    Token.delete(foundId);
                    return sendResponse(res, 200, true, "Account activated successfully");
                } else {
                    return sendResponse(res, 404, false, "User not found");
                }
            } else {
                if (foundId) {
                    Token.delete(foundId);
                    return sendResponse(res, 401, false, "Invalid token");
                }
                return sendResponse(res, 400, false, "Token expired or invalid");
            }
        }
        catch (err) {
            console.error('Error in account activating:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async refreshJWT(req, res) {
        try {
            const refreshToken = req.cookies;

            if(!refreshToken){
                return sendResponse(res, 400, false, "User not avtorized.", null);
            }
            
            const userData = validateRefreshToken(refreshToken);
            const tokenData = await new JWToken({}).findByProperty('token', refreshToken)

            if(!userData || !tokenData){
                return sendResponse(res, 400, false, "Token not valid or token not found.", null);
            }

            const user = await new User({}).findByProperty('id', userData.id);

            const tokens = generateTokens(user._id, user.role);
            await WebToken.saveToken(user.id, tokens.refreshToken);
            const userLikeObject = user.getLikeObject()
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

            return sendResponse(res, 200, true, "Token refreshed", { tokens: tokens, user: userLikeObject });
        }
        catch (err) {
            console.error('Token has not been updated:', err);
            return sendResponse(res, 500, false, "Server error. Token has not been updated:", null, err);
        }
    }

    // Validation methods
    static validateLogin() {
        return [
            check('login').notEmpty().withMessage('Login is required'),
            check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        ];
    }

    static validateReminder() {
        return [check('email_address').isEmail().notEmpty().withMessage('Email is required')];
    }

    static validateRegistration() {
        return [
            check('login').notEmpty().withMessage('Login is required'),
            check('password')
                .isLength({ min: 8 })
                .withMessage('Password must be at least 8 characters long')
                .matches(/[A-Z]/)
                .withMessage('Password must contain at least one uppercase letter')
                .matches(/[a-z]/)
                .withMessage('Password must contain at least one lowercase letter')
                .matches(/[0-9]/)
                .withMessage('Password must contain at least one number')
                .matches(/[!@#\$%\^\&*\)\(+=._-]/)
                .withMessage('Password must contain at least one special character'),
            check('confirmPassword').custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords must match');
                }
                return true;
            }),
            check('email_address').isEmail().withMessage('Invalid email address'),

        ];
    }

    static isValidPassword() {
        return [check('new_password')
            .optional()
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
            .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain at least one number')
            .matches(/[!@#\$%\^\&*\)\(+=._-]/)
            .withMessage('Password must contain at least one special character'),
        check('email_address').optional().isEmail().withMessage('Invalid email address')
        ];
    }
}

module.exports = authController;
