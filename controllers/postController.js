const { sendResponse, hashPassword } = require('../service/helperFunction.js');
const Post = require("../models/post.js");
const Comment = require("../models/comment.js");
const User = require("../models/user.js");
const Like = require("../models/like.js");
const { check, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

class postsController {
    static async allPosts(req, res) {
        try {
            const isAdmin = req.user && req.user.roles === 'admin';

            // console.log("-------------isAdmin------------");
            // console.log(req.user);
            // console.log("-------------isAdmin------------");

            const posts = isAdmin ?
                await Post.findAll() :
                await Post.findAll({ status: 'active' });


            return posts ?
                sendResponse(res, 200, true, "All posts retrieved", posts) :
                sendResponse(res, 404, false, "No post found");
        } catch (err) {
            return sendResponse(res, 500, false, "Error retrieving posts", null, err.message);
        }
    }

    static async getPostById(req, res) {
        try {
            const post_id = req.params.post_id;
            const isAdmin = req.user && req.user.roles === 'admin';
            // console.log(typeof Post);
            const post = new Post({});
            await post.findByProperty("id", post_id)

            return (post && (post.status === 'active' || isAdmin)) ?
                sendResponse(res, 200, true, `The post with id = ${post_id} was found`, post.getLikeObject()) :
                sendResponse(res, 404, false, `No post with id = ${post_id} found or this post inactive`);
        } catch (err) {
            return sendResponse(res, 500, false, `Error retrieving post with id = ${post_id}`, null, err.message);
        }
    }

    static async addPost(req, res) {
        const post = new Post({
            ...req.body,
            author_id: req.user.id,
            publish_date: new Date()
        });

        try {
            const result = await post.save();

            return result ?
                sendResponse(res, 200, true, "The post has been successfully added", null) :
                sendResponse(res, 404, false, "Post was not save");
        } catch (err) {
            return sendResponse(res, 500, false, "An error occurred while saving the post", null, err.message);
        }
    }

    static async addNewComment(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return sendResponse(res, 400, false, `Validtion errors`, errors);
            }

            const content = req.body.content;
            const post_id = req.params.post_id;
            const comment = new Comment({ author_id: req.user.id, content: content, post_id: post_id, publish_date: new Date() });
            const result = await comment.save();

            return result ?
                sendResponse(res, 200, true, "The comment has been successfully added", null) :
                sendResponse(res, 404, false, "No comment added");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while saving the comment", null, err.message);
        }
    }

    static async getAllCommentsForPost(req, res) {
        try {
            const postId = req.params.post_id;
            const allComments = await Post.allCommForPost(postId);

            return allComments ?
                sendResponse(res, 200, true, "All comments retrieved", allComments) :
                sendResponse(res, 404, false, "No comment found");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while get all the comments", null, err.message);
        }
    }

    static async getAllCategoriesForPost(req, res) {
        try {
            const postId = req.params.post_id;
            const allCategories = await Post.allCategoriesForPost(postId);

            return allCategories ?
                sendResponse(res, 200, true, "All categories retrieved", allCategories) :
                sendResponse(res, 404, false, "No categories found");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while get all the categories", null, err.message);
        }
    }

    static async addLikeToPost(req, res) {
        try {
            const postId = req.params.post_id;
            const type = req.body.type_like;

            const newPost = new Post({});
            if (await newPost.findByProperty('id', postId) === false) {
                return sendResponse(res, 500, false, `Post with id = ${postId} does not exist`);
            }
            if (await Like.checkLikeExists(req.user.id, postId, "post") !== null) {
                const remRes = await Like.removeLike(req.user.id, postId, "post");
                if (!remRes) {
                    return sendResponse(res, 500, false, "Error in deleting a like ");
                }
            }
            const result = await Like.addLike(req.user.id, postId, "post", type);

            User.calculateRating(newPost.author_id);

            return result ?
                sendResponse(res, 200, true, "Like has been added") :
                sendResponse(res, 404, false, "A like has not been added");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while add like/dislike", null, err.message);
        }
    }

    static async addLikeToComment(req, res){
        try {
            const commentId = req.params.comment_id;
            const type = req.body.type_like;

            const newComment = new Comment({});
            if (await newComment.findByProperty('id', commentId) === false) {
                return sendResponse(res, 500, false, `Comment with id = ${commentId} does not exist`);
            }
            if (await Like.checkLikeExists(req.user.id, commentId, "comment") !== null) {
                const remRes = await Like.removeLike(req.user.id, commentId, "comment");
                if (!remRes) {
                    return sendResponse(res, 500, false, "Error in deleting a like ");
                }
            }
            const result = await Like.addLike(req.user.id, commentId, "comment", type);

            User.calculateRating(newComment.author_id);

            return result ?
                sendResponse(res, 200, true, "Like has been added") :
                sendResponse(res, 404, false, "A like has not been added");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while add like/dislike", null, err.message);
        }
    }

    static async getAllLikesOnPost(req, res) {
        try {
            const postId = req.params.post_id;
            // const type = req.body.type_like;
            const likeCount = await Like.getLikeCount(postId, "post", "like");
            const dislikeCount = await Like.getLikeCount(postId, "post", "dislike");

            return (likeCount | dislikeCount) ?
                sendResponse(res, 200, true, "The number of likes we've gotten ", { like: likeCount, dislike: dislikeCount }) :
                sendResponse(res, 404, false, "Failed to get likes or no such post exists");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while get like/dislike", null, err.message);
        }
    }

    static async removePost(req, res) {
        try {
            const postId = req.params.post_id
            // console.log(req.user.id);
            const post = new Post({});
            await post.findByProperty('id', postId);
            // console.log(post.author_id)

            const result = await post.delete(postId);

            return result ?
                sendResponse(res, 200, true, "The post has been deleted") :
                sendResponse(res, 500, false, `Post with id = ${postId} does not exist or was not found`);
        }
        catch (err) {
            return sendResponse(res, 500, false, `An error occurred while remove post`, null, err.message);
        }
    }

    static async removeLikesOnPost(req, res) {
        try {
            const postId = req.params.post_id;
            const result = await Like.removeLike(req.user.id, postId, "post")

            console.log(result);

            return result ?
                sendResponse(res, 200, true, `Like has been removed from the post with id ${postId}`) :
                sendResponse(res, 404, false, "Failed to remove likes or no such post exists");

        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while remove like/dislike", null, err.message);
        }
    }
    
    static async removeLikesOnComm(req, res) {
        try {
            const commId = req.params.comment_id;
            const result = await Like.removeLike(req.user.id, commId, "comment")

            console.log(result);

            return result ?
                sendResponse(res, 201, true, `Like has been removed from the comment with id ${commId}`) :
                sendResponse(res, 404, false, "Failed to remove likes or no such comment exists");

        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while remove like/dislike", null, err.message);
        }
    }

    static async updatePost(req, res) {
        try {
            const newData = req.body
            const postId = req.params.post_id
            const result = await Post.updateById(postId, newData);

            return result ?
                sendResponse(res, 200, true, `The post with identifier ${postId} has been updated successfully`) :
                sendResponse(res, 404, false, "Failed to update likes or no such post exists");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while update post", null, err.message);
        }
    }

    static async updateStatusPost(req, res) {
        try {
            const newData = req.body
            const postId = req.params.post_id
            const result = await Post.updateById(postId, newData);

            return result ?
                sendResponse(res, 200, true, `The post with identifier ${postId} has been updated successfully`) :
                sendResponse(res, 404, false, "Failed to update likes or no such post exists");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while update post", null, err.message);
        }
    }

    static async addPostPictures(req, res) {
        try {
            console.log("-------------updatePostPictures-----------");
            console.log('Request body:', req.body);
            console.log('Uploaded file:', req.file);
            const postId = req.params.post_id;
            const files = req.files;

            const newPost = new Post({});
            await newPost.findByProperty("id", postId)
            console.log(`user: ${newPost}`);

            if (!files || files.length === 0) {
                return sendResponse(res, 400, false, `No file uploaded`);
            }

            if (!newPost) {
                return sendResponse(res, 404, false, `Post with ID ${postId} not found`);
            }

            // const oldAvatarPath = user.profile_picture;

            // console.log(`oldAvatarPath ${oldAvatarPath}`)

            const imagesPath = [];
            for (const file of files) {
                const pathPhoto = `/uploads/postPhotos/${file.filename}`;
                await Post.addImage(postId, pathPhoto);
                imagesPath.push(pathPhoto);
            }

            return sendResponse(res, 200, true, 'Photos add successfully', { images: imagesPath });
        }
        catch (err) {
            return sendResponse(res, 500, false, "Error add photos", null, err.message);
        }
    }

    static async getAllPhotosForPost(req, res) {
        try {
            const postId = req.params.post_id;
            const allPhotos = await Post.getAllImage(postId);

            return allPhotos ?
                sendResponse(res, 200, true, "All photos retrieved", allPhotos) :
                sendResponse(res, 404, false, "No photos found");
        }
        catch (err) {
            return sendResponse(res, 500, false, "An error occurred while get all the photos", null, err.message);
        }
    }

    static async deletePostPictures(req, res) {
        try {
            console.log("-------------deletePostPictures-----------");
            console.log('Request body:', req.body);
            console.log('Uploaded file:', req.file);
            const postId = req.params.post_id;
            const files = req.body.files;

            const newPost = new Post({});
            await newPost.findByProperty("id", postId);
            const allPhotos = await Post.getAllImage(postId);
            console.log({ allPhotos });

            if (!files || files.length === 0) {
                return sendResponse(res, 400, false, `No file uploaded`);
            }

            if (!newPost) {
                return sendResponse(res, 404, false, `Post with ID ${postId} not found`);
            }

            const deletedPhotos = [];
            for (const file of files) {
                if (allPhotos.some(photo => photo.image_path.includes(file))) {
                    console.log(`Photo with name: ${file} already exists`);

                    await Post.deleteImage(postId, file);

                    const absolutePath = path.join(__dirname, '..', file);
                    try {
                        await fs.unlink(absolutePath);
                        deletedPhotos.push(file);
                        console.log(`Deleted photo: ${file}`);
                    } catch (err) {
                        console.error('Error deleting photo:', err);
                    }
                }
            }

            console.log(deletedPhotos)

            return deletedPhotos.length !== 0 ?
                sendResponse(res, 200, true, 'Photos deleted successfully', { deletetImages: deletedPhotos }) :
                sendResponse(res, 400, true, 'Photos does not exist');
        }
        catch (err) {
            return sendResponse(res, 500, false, "Error delete photos", null, err.message);
        }
    }

    static async getAllPostsWithFilterAndSort(req, res) {
        try {
            const isAdmin = req.user && req.user.roles === 'admin';
            
            const filters = {
                isAdmin: isAdmin,
                category: req.body.category,
                authorId: req.body.authorId,
                status: req.body.status,
                search: req.body.search,
                sortBy: req.body.sortBy,
                order: req.body.order
            };

            const posts = await Post.getAllPostsWithFilter(filters);

            return posts.length > 0 ?
                sendResponse(res, 200, true, "Posts retrieved and filtered", posts) :
                sendResponse(res, 404, false, "No posts found with the given filters");
        } catch (err) {
            return sendResponse(res, 500, false, "Error retrieving posts", null, err.message);
        }
    }
    

    static validateCommentUpdate() {
        return [
            check('content').optional().isString().withMessage('Content must be a string').notEmpty()
                .withMessage('Content cannot be empty')
        ];
    }
}

module.exports = postsController;