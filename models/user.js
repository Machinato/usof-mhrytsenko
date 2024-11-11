const Model = require("./model.js");
const Like = require("./like.js");
const Favorite = require("./favorites.js");
const Post = require("./post.js");
const Comm = require("./comment.js");
const { sendResponse } = require("../service/helperFunction.js");

const TABLE_NAME = 'users';

class User extends Model {
    static _tableName = TABLE_NAME
    
    constructor(user) {
        super(TABLE_NAME, User._fields);
        this.login = user.login || null;
        this.password = user.password || null;
        this.full_name = user.full_name || null;
        this.email_address = user.email_address || null;
        this.role = user.role || "user";
        this.profile_picture = user.profile_picture || null;
        this.rating = user.rating || 1;
        this.is_activated = user.is_activated || 0;
    }

    static get _fields() {
        return ['id', 'login', 'password', 'full_name', 'email_address', 'profile_picture', 'rating', 'role', 'is_activated'];
    }

    async paswordConf() {
        const [rows] = await this.db.query(
            `SELECT users.password FROM users  
            WHERE users.login = ?`, [this.login]);

        return this.password === rows[0].password;
    }

    async save() {
        try {
            // console.log(await this.findByProperty('login', this.login));
            // console.log(await this.findByProperty('email_address', this.email_address));
            if (!await this.findByProperty('login', this.login) && !await this.findByProperty('email_address', this.email_address)) {
                return await super.save();
            } else {
                console.log("User exist. No user insert")
                return false;
            }
        } catch (err) {
            console.error(err);
            return false 
        }
    }

    static async calculateRating(userId){
        try{
            const allPostsWithUserId = await Post.findAll({author_id: userId});
            const allCommsWithUserId = await Comm.findAll({author_id: userId})

            const postsId = [];
            const commId = [];

            allPostsWithUserId.forEach(post => postsId.push(post.id));
            allCommsWithUserId.forEach(comm => commId.push(comm.id));

            const allLikeAndDislike = await Like.findAll();

            let rating = 0;

            console.log(postsId);
            console.log(commId);

            allLikeAndDislike.forEach(like => {
                if(postsId.includes(like.target_id) || commId.includes(like.target_id)){
                    console.log(like.type);
                    like.type === "like" ? rating++ : rating--;
                    console.log(rating);

                }
            });
            
            await User.updateById(userId, {rating: rating});

            console.log(rating);
        }
        catch (err){
            console.error(err)
            return false;
        }
    }

    static async addPostToFavorites(userId, postId){
        try{
            const newFvorite = new Favorite({user_id: userId, post_id: postId});
            
            const ifAlreadyExist = await Favorite.findAll({user_id: userId, post_id: postId})

            console.log(ifAlreadyExist.length)

            if(ifAlreadyExist.length >= 1){
                throw new Error(`This post is already in favorites`);
            }
        
            const result = await newFvorite.save();
            return result;
        }
        catch (err){
            console.error(err);
            throw new Error(`Something wrong at addPostToFavorites function: ${err}`);
        }
    }

    static async deleteFavoritePost(favoriteIdd){
        try{
            const newFvorite = new Favorite({});
            await newFvorite.findByProperty('id', favoriteIdd)
            const result = await newFvorite.delete();
            return result;
        }
        catch (err){
            console.error(err);
            throw new Error(`Something wrong at addPostToFavorites function: ${err}`);
        }
    }
}

module.exports = User;