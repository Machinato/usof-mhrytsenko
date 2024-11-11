const Model = require("./model.js");

const TABLE_NAME = 'comments';

class Comment extends Model{
    static _tableName = TABLE_NAME;

    constructor(comment){
        super('comments', Comment._fields);
        this.author_id = comment.author_id; // ID пользователя, который является автором комментария
        this.post_id = comment.post_id;
        this.content = comment.content; // Текст комментария
        this.publish_date = comment.publish_date; // Дата публикации комментария
        this.status = comment.status || 'active';
    }

    static get _fields() {
        return ['id', 'author_id', 'post_id', 'content', 'publish_date', 'status'];
    }

    async save() {
        try {
            const result = super.save();
            return result;
        } catch (err) {    
            console.error(err);
            throw err;
        }
    }

}

module.exports = Comment;