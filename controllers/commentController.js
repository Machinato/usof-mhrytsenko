const Comment = require('../models/comment.js');
const Like = require('../models/like.js');
const { sendResponse } = require('../service/helperFunction.js');
const { check } = require('express-validator');

class CommenController {
    static async getCommet(req, res) {
        try {
            const commId = req.params.comment_id

            const newComment = new Comment({});
            const findResult = await newComment.findByProperty('id', commId);

            return findResult ?
                sendResponse(res, 200, true, "Comment was found and sent ", findResult.getLikeObject()) :
                sendResponse(res, 400, false, "Comment was not found and sent", null);
        }
        catch (err) {
            console.error('Error in get comment function:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async getAllLikes(req, res) {
        try {
            const commId = req.params.comment_id

            const LikeCount = await Like.getLikeCount(commId, "comment", "like");
            const DislikeCount = await Like.getLikeCount(commId, "comment", "dislike")

            return (LikeCount || DislikeCount) ?
                sendResponse(res, 200, true, `Likes was found at comment with id = ${commId}`, { Like: LikeCount, Dislike: DislikeCount }) :
                sendResponse(res, 400, false, `Likes was not found at comment with id = ${commId}`, null);
        }
        catch (err) {
            console.error('Error in get all Likes under the comment function:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async addLike(req, res) {
        try {
            const commId = req.params.comment_id;
            const type = req.body.type_like;

            if (await Comment.findByProperty("id", commId) === false) {
                return sendResponse(res, 500, false, `Comment with id = ${commId} does not exist`);
            }
            if (await Like.checkLikeExists(req.user.id, commId, "comment") !== null) {
                const remRes = await Like.removeLike(req.user.id, commId, "comment");

                if (!remRes) {
                    return sendResponse(res, 500, false, "Error in deleting a like ");
                }
            }
            const result = await Like.addLike(req.user.id, commId, "comment", type);

            return result ?
                sendResponse(res, 200, true, "Like has been added to comment") :
                sendResponse(res, 404, false, "A like has not been added to comment");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while add like/dislike", null, err.message);
        }
    }

    static async updateComment(req, res) {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                return sendResponse(res, 400, false, `Validtion errors`, errors);
            }
            
            const commId = req.params.comment_id

            const updateResult = Comment.updateById(commId, req.body);

            return updateResult.affectedRows > 0 ?
                sendResponse(res, 200, true, `Comment with id = ${commId} was updated`, null) :
                sendResponse(res, 400, false, `Comment with id = ${commId} was not updated`, null);
        }
        catch (err) {
            console.error('Error in update comment function:', err);
            return sendResponse(res, 500, false, "Server error", null, err);
        }
    }

    static async deleteComment(req, res) {
        try {
            const commId = req.params.comment_id

            const newComment = new Comment({});
            const findResult = await newComment.findByProperty('id', commId);

            if (!findResult) {
                return sendResponse(res, 400, false, `Comm with id = ${commId} was not found`);
            }

            const result = await post.delete(postId);

            return result ?
                sendResponse(res, 200, true, "The post has been deleted") :
                sendResponse(res, 500, false, `Post with id = ${postId} does not exist or was not found`);
        }
        catch (err) {
            return sendResponse(res, 500, false, `An error occurred while remove post`, null, err.message);
        }
    }

    static async deleteLikesOnComment(req, res) {
        try {
            const commId = req.params.comment_id;
            const result = await Like.removeLike(req.user.id, commId, "comment");

            return result ?
                sendResponse(res, 200, true, `Like has been removed from the comment with id ${postId}`) :
                sendResponse(res, 404, false, "Failed to remove likes or no such comment exists");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while remove like/dislike", null, err.message);
        }
    }

    static async updateStatusComment(req, res) {
        try {
            const newData = req.body
            const commentId = req.params.comment_id
            const result = await Comment.updateById(commentId, newData);

            return result ?
                sendResponse(res, 200, true, `The comment status with identifier ${commentId} has been updated successfully`) :
                sendResponse(res, 404, false, "Failed to update likes or no such comment exists");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while update post", null, err.message);
        }
    }

    static validateCommentUpdate() {
        return [
            check('content')
                .optional()
                .isString().withMessage('Content must be a string')
                .notEmpty().withMessage('Content cannot be empty')
        ]
    }
}

module.exports = CommenController;
