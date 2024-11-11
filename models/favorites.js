const Model = require("./model.js");

const TABLE_NAME = 'favorite_posts';

class Favorites extends Model{
    static _tableName = TABLE_NAME

    constructor(favorite){
        super(TABLE_NAME, Favorites._fields);
        this.id = favorite.id || null;
        this.user_id = favorite.user_id || null;
        this.post_id = favorite.post_id || null;
    }

    static get _fields() {
        return ['id', 'user_id', 'post_id'];
    }
}

module.exports = Favorites;