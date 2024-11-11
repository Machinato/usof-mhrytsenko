const Model = require("./model.js");

const TABLE_NAME = 'likes';

class Like extends Model{
    static _tableName = TABLE_NAME

    constructor(Like){
        super(TABLE_NAME, Category._fields)
        this.author_id = Like.author_id;         // ID пользователя, который поставил лайк/дизлайк
        this.target_id = Like.target_id;         // ID поста или комментария, к которому относится лайк/дизлайк
        this.target_type = target_type;     // Тип цели: 'post' или 'comment'
        this.type = Like.type;                   // Тип: "like" или "dislike"
        this.publish_date = Like.publish_date;   // Дата добавления лайка/дизлайка
    }

    static get _fields() {
        return ['id', 'autor_id', 'target_id', 'target_type', 'type', 'publish_date'];
    }

    // Метод для добавления нового лайка/дизлайка
    static async addLike(author_id, target_id, target_type, type) {
        const query = `
            INSERT INTO likes (author_id, target_id, target_type, type, publish_date)
            VALUES (?, ?, ?, ?, ?)
        `;
        const publish_date = new Date();
        const values = [author_id, target_id, target_type, type, publish_date];
        try {
            const [result] = await this.db.query(query, values);
            return result.insertId;  // Возвращает ID добавленного лайка/дизлайка
        } catch (err) {
            throw new Error('Error adding like/dislike: ' + err.message);
        }
    }

    // Метод для проверки, существует ли уже лайк/дизлайк для поста/комментария от этого пользователя
    static async checkLikeExists(author_id, target_id, target_type) {
        const query = `
            SELECT * FROM likes WHERE author_id = ? AND target_id = ? AND target_type = ?
        `;
        const values = [author_id, target_id, target_type];
        try {
            const [rows] = await this.db.query(query, values);
            return rows.length > 0 ? rows[0] : null;  // Возвращает объект лайка/дизлайка или null
        } catch (err) {
            throw new Error('Error checking like existence: ' + err.message);
        }
    }

    // Метод для удаления лайка/дизлайка
    static async removeLike(author_id, target_id, target_type) {
        const query = `
            DELETE FROM likes WHERE author_id = ? AND target_id = ? AND target_type = ?
        `;
        const values = [author_id, target_id, target_type];
        try {
            const [result] = await this.db.query(query, values);
            return result.affectedRows > 0;  // Возвращает true, если лайк/дизлайк был удален
        } catch (err) {
            throw new Error('Error removing like/dislike: ' + err.message);
        }
    }

    // Метод для получения количества лайков/дизлайков для поста/комментария
    static async getLikeCount(target_id, target_type, type) {
        const query = `
            SELECT COUNT(*) AS count FROM likes WHERE target_id = ? AND target_type = ? AND type = ?
        `;
        const values = [target_id, target_type, type];
        try {
            const [rows] = await this.db.query(query, values);
            return rows[0].count;  // Возвращает количество лайков/дизлайков
        } catch (err) {
            throw new Error('Error getting like/dislike count: ' + err.message);
        }
    }
}

module.exports = Like;