const express = require('express');
const postRouter = express.Router();
const PostController = require('../controllers/postController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const ownProfileMiddleware = require('../middleware/ownProfileMiddleware.js');
const changeProfilePermissions = require('../middleware/changeProfilesPermissions.js');
const userDataMiddleware = require('../middleware/userData.js');
const uploadPhotos = require('../uploads/uploadfunction/uploadPhotosToPost.js');

const restrictedFields = {
    user: ['id', 'author_id','publish_date'],
    admin: ['id', 'author_id', 'content', 'publish_date', 'title', 'image_path'] 
};

const restrictedFieldsForStatusUpdate = {
    user: ['id', 'author_id', 'title', 'publish_date', 'content', 'image_path'],
    admin: ['id', 'author_id', 'title', 'publish_date', 'content', 'image_path'] 
};

postRouter.get('/', userDataMiddleware, PostController.allPosts);
postRouter.get('/with_filter', userDataMiddleware, PostController.getAllPostsWithFilterAndSort);
postRouter.get('/:post_id', userDataMiddleware, PostController.getPostById);
postRouter.get('/:post_id/comments', PostController.getAllCommentsForPost);
postRouter.post('/:post_id/comments', authMiddleware, PostController.validateCommentUpdate(), PostController.addNewComment);
postRouter.get('/:post_id/categories', PostController.getAllCategoriesForPost);
postRouter.get('/:post_id/like', PostController.getAllLikesOnPost);
postRouter.post('/', authMiddleware, PostController.addPost);
postRouter.post('/:post_id/like', authMiddleware, PostController.addLikeToPost);
postRouter.patch ('/:post_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), changeProfilePermissions(restrictedFields), PostController.updatePost);
postRouter.patch ('/:post_id/status', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), changeProfilePermissions(restrictedFieldsForStatusUpdate), PostController.updateStatusPost);
postRouter.delete('/:post_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), PostController.removePost);
postRouter.delete('/:post_id/like', roleMiddleware(["admin", "user"]), PostController.removeLikesOnPost);
postRouter.delete('/:comment_id/comment_like', roleMiddleware(["admin", "user"]), PostController.removeLikesOnComm);
postRouter.post('/:post_id/photos', authMiddleware, uploadPhotos, ownProfileMiddleware(["user", "admin"]), PostController.addPostPictures);
postRouter.get('/:post_id/photos', PostController.getAllPhotosForPost);
postRouter.delete('/:post_id/photos', authMiddleware, ownProfileMiddleware(["user", "admin"]), PostController.deletePostPictures);
postRouter.post('/:comment_id/comment_like', authMiddleware, PostController.addLikeToComment);

module.exports = postRouter;