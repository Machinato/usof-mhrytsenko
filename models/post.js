const Model = require("./model.js");
const Category = require("../models/category.js");
const Like = require("../models/like.js");

const TABLE_NAME = 'posts';

class Post extends Model {
    static _tableName = TABLE_NAME;

    constructor(post) {
        super('posts', Post._fields);
        this.author_id = post.author_id || '';
        this.title = post.title || '';
        this.publish_date = post.publish_date || null;
        this.status = post.status || 'active';
        this.content = post.content || '';
        this.categories = post.categories || [];
    }

    static get _fields() {
        return ['id', 'author_id', 'title', 'publish_date', 'status', 'content'];
    }

    static async addImage(postId, imagePath) {
        try {
            const sql = 'INSERT INTO post_images (post_id, image_path) VALUES (?, ?)';
            const result = await this.db.query(sql, [postId, imagePath]);
            return result;
        }
        catch (err) {
            throw new Error(`Error at addImage function: ${err}`)
        }
    }

    static async getAllImage(postId) {
        try {
            const sql = `SELECT * FROM post_images WHERE post_id = ?`;
            const [result] = await this.db.query(sql, [postId]);
            return result;
        }
        catch (err) {
            throw new Error(`Error at getAllImage function: ${err}`)
        }
    }

    static async deleteImage(postId, imagePath) {
        try {
            const sql = 'DELETE FROM post_images WHERE post_id = ? AND image_path = ?';
            console.log(imagePath);
            const result = await this.db.query(sql, [postId, imagePath]);
            return result;
        }
        catch (err) {
            throw new Error(`Error at deleteImage function: ${err}`)
        }
    }

    async save() {
        try {
            const result = await super.save();

            await Post.updateCategories(this.id, this.categories);

            console.log(result);

            return result;

        } catch (err) {
            console.error(err);
            throw new Error(`Failed to save post: ${err}`);
        }
    }

    static async updateById(postId, newData) {
        try {
            console.log(`newData = ${newData}`)
            const { categories, ...dataWithoutCategories } = newData || {};
            console.log(`dataWithoutCategories = ${dataWithoutCategories}`)
            const result = await super.updateById(postId, dataWithoutCategories)

            if (result.affectedRows > 0) {
                if (newData.categories && newData.categories.length > 0) {
                    await Post.updateCategories(postId, categories);
                }
                return true;
            } else {
                throw new Error('Post not found or not authorized to update');
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async updateCategories(postId, categories) {
        try {
            console.log("--------------updateCategories---------------");

            await Post.db.execute(`DELETE FROM post_categories WHERE post_id = ?`, [postId]);

            for (const category of categories) {
                const category_id = await Category.getIdByName(category);
                console.log(category_id);
                await Post.db.execute(`INSERT INTO post_categories (post_id, categories_id) VALUES (?, ?)`, [postId, category_id]);
            }
        }
        catch (err) {
            throw err;
        }
    }

    async findByProperty(property, value) {
        try {
            await super.findByProperty(property, value);
            this.categories = await Post.allCategoriesForPost(this.id);
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async allCommForPost(post_id) {
        try {
            let [allComm] = await this.db.query(`SELECT * FROM comments WHERE post_id = ?`, [post_id]);
            if (allComm.length === 0) { return false; }

            return allComm;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async allCategoriesForPost(post_id) {
        try {
            let [allCategories] = await this.db.query(`SELECT * FROM post_categories WHERE post_id = ?`, [post_id]);
            if (allCategories.length === 0) { return false; }

            console.log(allCategories);

            let resultArray = [];
            for (const category of allCategories) {
                const cat = new Category({});
                resultArray.push(await Category.getCategoryById(category.categories_id))
            }

            return resultArray;
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }

    static async getAllPostsWithFilter(filters) {
        try {
            const { isAdmin, category, authorId, status, search, sortBy = 'publish_date', order = 'DESC' } = filters;
    
            let query = isAdmin 
                ? `SELECT p.*, GROUP_CONCAT(c.name ORDER BY c.name) AS category_names
                    FROM posts p
                    JOIN post_categories pc ON p.id = pc.post_id
                    JOIN categories c ON pc.categories_id = c.id
                    WHERE 1=1`
                : `SELECT p.*, GROUP_CONCAT(c.name ORDER BY c.name) AS category_names
                    FROM posts p
                    JOIN post_categories pc ON p.id = pc.post_id
                    JOIN categories c ON pc.categories_id = c.id
                    WHERE p.status = 'active'`;
    
            // Условия фильтрации
            if (category) query += ` AND c.name = '${category}'`; // Фильтрация по точному совпадению категории
            if (authorId) query += ` AND p.author_id = '${authorId}'`;
            if (status) query += ` AND p.status = '${status}'`;
    
            // Фильтрация по ключевому слову
            if (search) {
                query += ` AND (p.title LIKE '%${search}%' OR p.content LIKE '%${search}%')`;
            }
    
            // Добавление группировки и сортировки
            query += ` GROUP BY p.id ORDER BY ${sortBy} ${order}`;
    
            // Выполняем запрос
            const [posts] = await this.db.query(query);
    
            return posts;
        } catch (err) {
            console.error("Error in getAllPosts:", err.message);
            throw new Error("Error retrieving posts");
        }
    }
           
}

module.exports = Post;