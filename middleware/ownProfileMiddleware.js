const { sendResponse } = require('../service/helperFunction.js');
const jwt = require('jsonwebtoken');
const { SECRET_ACCESS, SECRET_REFRESH } = require('../config.json');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');
const Favorites = require('../models/favorites.js');

module.exports = function (checkedRoles = []) {
    return async function (req, res, next) {
        try {
            console.log("---------ownProfileMiddleware--------")
            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return sendResponse(res, 403, false, "User not authorized")
            }

            const decData = jwt.verify(token, SECRET_ACCESS);
            //const { user_id, post_id, comment_id } = req.params;

            const post_id = req.params.post_id || req.body.post_id;
            console.log(post_id);

            const user_id = req.params.user_id || req.body.user_id;
            //console.log(user_id);

            const comment_id = req.params.comment_id || req.body.comment_id;
            //console.log(comment_id);

            const favorite_id = req.params.favorite_id || req.body.favorite_id;

            let userId = user_id;

            if (post_id) {
                const newPost = new Post({});
                const resultFind = await newPost.findByProperty('id', post_id);

                console.log(resultFind);

                userId = newPost.author_id;
                console.log(userId);
            } else if (comment_id) {
                const newComment = new Comment({});
                await newComment.findByProperty('id', comment_id);

                userId = newComment.author_id;
            } else if (favorite_id) {
                const newfavorite = new Favorites({});
                await newfavorite.findByProperty('id', favorite_id);

                userId = newfavorite.user_id;
            }

            if (!userId) {
                return sendResponse(res, 403, false, "User ID not found for validation");
            }
        
            if (checkedRoles.includes(decData.roles)) {
                if (decData.id !== Number(userId)) {
                    return sendResponse(res, 403, false, "Access denied: not your profile");
                }
            }

            next();
        }
        catch (e) {
            console.log(e);
            return sendResponse(res, 403, false, "User not authorized")
        }
    };
};
