const express = require('express');
const usersRouter = express.Router();
const UsersController = require('../controllers/userController.js');
const upload = require('../uploads/uploadfunction/uploadAvatar.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const ownProfileMiddleware = require('../middleware/ownProfileMiddleware.js');
const changeProfilePermissions = require('../middleware/changeProfilesPermissions.js');
const userData = require('../middleware/userData.js');

const restrictedFields = {
    user: ['id', 'role', 'rating', 'profile_picture'],
    admin: ['id', 'profile_picture', 'rating']
};

usersRouter.get('/', roleMiddleware(["admin"]), UsersController.allUsers);
usersRouter.get('/favorite', roleMiddleware(["admin", "user"]), UsersController.getAllFavorite);
usersRouter.get('/:user_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]),UsersController.getUserById);
usersRouter.post('/', roleMiddleware(["admin"]), UsersController.validateAddUser(),UsersController.addUser);
usersRouter.patch('/avatar', authMiddleware,  upload.single('avatar'), ownProfileMiddleware(["user"]), UsersController.updateAvatar);
usersRouter.patch('/:user_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), changeProfilePermissions(restrictedFields), UsersController.isValidPassword(), UsersController.updateUser);
usersRouter.delete('/:user_id', roleMiddleware(["admin"]), UsersController.deleteUser);
usersRouter.get('/:user_id/rating', userData, UsersController.userRating);
usersRouter.post('/favorite/:post_id',roleMiddleware(["admin", "user"]), ownProfileMiddleware(['user']), UsersController.addToFavorite);
usersRouter.delete('/favorite/:favorite_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(['user']), UsersController.deleteFavoritePost);

module.exports = usersRouter;
