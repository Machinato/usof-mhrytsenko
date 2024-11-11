const express = require('express');
const commentRouter = express.Router();
const CommentController = require('../controllers/commentController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const roleMiddleware = require('../middleware/roleMiddleware.js');
const ownProfileMiddleware = require('../middleware/ownProfileMiddleware.js');
const changeProfilePermissions = require('../middleware/changeProfilesPermissions.js');

const restrictedFields = {
    user: ['id', 'author_id', 'post_id', 'publish_date'],
    admin: ['id', 'author_id', 'post_id' ]
};

const restrictedFieldsForStatusUpdate = {
    user: ['id', 'author_id', 'post_id', 'publish_date', 'content'],
    admin: ['id', 'author_id', 'post_id', 'publish_date', 'content'] 
};

commentRouter.get('/:comment_id', CommentController.getCommet);
commentRouter.get('/:comment_id/like', CommentController.getAllLikes);
commentRouter.post('/:comment_id/like', authMiddleware, CommentController.addLike);
commentRouter.patch('/:comment_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), changeProfilePermissions(restrictedFields), CommentController.updateComment);
commentRouter.delete('/:comment_id', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), CommentController.deleteComment);
commentRouter.delete('/:comment_id/like', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), CommentController.deleteLikesOnComment);
commentRouter.patch ('/:comment_id/status', roleMiddleware(["admin", "user"]), ownProfileMiddleware(["user"]), changeProfilePermissions(restrictedFieldsForStatusUpdate), CommentController.updateStatusComment);

module.exports = commentRouter;