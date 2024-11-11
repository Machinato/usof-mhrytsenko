const { check, validationResult } = require('express-validator');
// const { check } = require("express-validator");
const User = require("../models/user.js");
const { sendResponse, hashPassword } = require('../service/helperFunction.js');
const fs = require('fs');
const path = require('path');
const Favorites = require('../models/favorites.js');

class usersController {
    // static sendResponse(res, statusCode, success, message, data = null, errors = null) {
    //     return res.status(statusCode).json({ success, message, data, errors });
    // }

    static async allUsers(req, res) {
        try {
            const users = await User.findAll();

            return users ?
            sendResponse(res, 200, true, "All users retrieved", users) :
            sendResponse(res, 404, false, "No users found");
        } catch (err) {
            return sendResponse(res, 500, false, "Error retrieving users", null, err.message);
        }
    }

    static async getUserById(req, res) {
        try {

            const user = new User({});
            const result = await user.findByProperty("id", req.params.user_id);


            return result ?
            sendResponse(res, 200, true, "User retrieved", user.getLikeObject()) :
            sendResponse(res, 404, false, "No user found");
        } catch (err) {
            return sendResponse(res, 500, false, "Error retrieving user", null, err.message);
        }
    }

    static async addUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }
        try {
            const hashedPassword = await hashPassword(req.body.password);
            let user = new User({ ...req.body, password: hashedPassword });

            let saveResult = await user.save();

            return saveResult ?
                sendResponse(res, 201, true, "User add successfully") :
                sendResponse(res, 500, false, "A user with this username or email already exists");

        } catch (err) {
            console.error('Error in register:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async updateUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, "Validation errors", null, errors.array());
        }

        try {
            const userId = req.params.user_id;
            const userData = req.body;

            if (userData.password) {
                userData.password = await hashPassword(req.body.password);
            }

            const result = await User.updateById(userId, userData);

            return (result.affectedRows > 0) ?
            sendResponse(res, 200, true, `User with ID ${userId} updated successfully`) :
            sendResponse(res, 404, false, `User with ID ${userId} not found`);
        } catch (err) {
            return sendResponse(res, 500, false, "Error updating user", null, err.message);
        }
    }

    static async deleteUser(req, res) {
        const userId = req.params.user_id;

        try {
            const user = new User({});
            await user.findByProperty('id', userId);
            const result = await user.delete();


            return result ?
                    sendResponse(res, 200, true, `User with ID ${userId} deleted successfully`) :
                    sendResponse(res, 404, false, `User with ID ${userId} not found`);
        } catch (err) {
            return sendResponse(res, 500, false, "Error deleting user", null, err.message);
        }
    }

    static async updateAvatar(req, res) {
        try {
            console.log("-------------updateAvatar-----------");
            console.log('Request body:', req.body);
            console.log('Uploaded file:', req.file);
            const userId = req.body.user_id;
            const file = req.file;

            const user = new User({});
            await user.findByProperty("id", userId)
            console.log(`user: ${user}`);

            if (!file) {
                return sendResponse(res, 400, false, `No file uploaded`);
            }

            if (!user) {
                return sendResponse(res, 404, false, `User with ID ${userId} not found`);
            }

            const oldAvatarPath = user.profile_picture;

            console.log(`oldAvatarPath ${oldAvatarPath}`)

            const pathAvatar = `/uploads/avatars/${file.filename}`;
            const result = await User.updateById(userId, { profile_picture: pathAvatar });

            console.log(`result ${result}`) 

            if (result.affectedRows > 0) {
                if ((oldAvatarPath) && (oldAvatarPath !== null)) {
                    const absolutePath = path.join(__dirname, '..', oldAvatarPath);
                    console.log(`absolutePath: ${absolutePath}`);
                    
                    fs.unlink(absolutePath, (err) => {
                        if (err) {
                            console.error('Error deleting old avatar:', err);
                        } else {
                            console.log('Old avatar deleted successfully');
                        }
                    });
                }

                return sendResponse(res, 200, true, 'Avatar updated successfully', { profile_picture: pathAvatar });
            } else {
                return sendResponse(res, 404, false, `User with ID ${userId} not found`);
            }
        }
        catch (err) {
            return sendResponse(res, 500, false, "Error updating avatar", null, err.message);
        }
    }

    static async userRating(req, res) {
        try {
            const rating = await User.calculateRating(req.params.user_id);

            return rating ?
            sendResponse(res, 200, true, "User rating was calculated", rating) :
            sendResponse(res, 404, false, "No users found");
        } catch (err) {
            return sendResponse(res, 500, false, "Error retrieving users", null, err.message);
        }
    }

    static async addToFavorite(req, res) {
        try {
            const userId = req.user.id;
            const postId = req.params.post_id;
        
            const result = await User.addPostToFavorites(userId, postId)    

            return result ?
            sendResponse(res, 200, true, "Post add to favorite successfully", result) :
            sendResponse(res, 404, false, "The post was not added to favorites");
        } catch (err) {
            return sendResponse(res, 500, false, "Error adding to favorites ", null, err.message);
        }
    }

    static async deleteFavoritePost(req, res) {
        try {
            const favoriteId = req.params.favorite_id;
            const result = await User.deleteFavoritePost(favoriteId)    

            return result ?
            sendResponse(res, 200, true, "Favorite post delete successfully", result) :
            sendResponse(res, 404, false, "The favorite post was not delete");
        } catch (err) {
            return sendResponse(res, 500, false, "Error adding to favorites ", null, err.message);
        }
    }

    static async getAllFavorite(req, res) {
        try {
            const result = await Favorites.findAll({user_id: req.user.id})    

            return result ?
            sendResponse(res, 200, true, "All favorite posts", result) :
            sendResponse(res, 404, false, "The favorite posts was not found");
        } catch (err) {
            return sendResponse(res, 500, false, "Error get favorite post", null, err.message);
        }
    }

    static validateAddUser() {
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
            check('role').notEmpty().withMessage('Role must be admin or user').custom((value) => {
                if (value !== 'admin' && value !== 'user') {
                    throw new Error('Role must be either admin or user');
                }
                return true;
            })
        ];
    }

    static isValidPassword() {
        return [check('password')
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
        check('email').optional().isEmail().withMessage('Invalid email address')
        ];
    }
}



module.exports = usersController;