const Model = require("./model.js");


const TABLE_NAME = 'categories';

class Category extends Model {
    static _tableName = TABLE_NAME;

    constructor(category) {
        super(TABLE_NAME, Category._fields)
        this.id = category.id || null;
        this.name = category.name || null;
        this.description = category.description || '';
    }

    static get _fields() {
        return ['id', 'name', 'description'];
    }

    static async getIdByName(name) {
        const query = `SELECT id FROM categories WHERE name = ?`;
        const [rows] = await this.db.execute(query, [name]);

        if (rows.length > 0) {
            return rows[0].id;
        } else {
            // // Если категории с таким названием нет, можно добавить её в базу
            // console.log("new caterofy-----------------------------")
            // const result = await this.db.execute(`INSERT INTO categories (name) VALUES (?)`, [name]);
            // return result[0].insertId;
            throw new Error(`Category with name (${name}) does not exist`);
        }
    }

    static async getCategoryById(id) {
        // console.log(id);
        const query = `SELECT * FROM categories WHERE id = ?`;
        const [rows] = await this.db.execute(query, [id]);

        // console.log(`rows : ${rows}`)

        if (rows.length > 0) {
            return rows[0];
        } else {
            // Если категории с таким названием нет, можно добавить её в базу
            return false;
        }
    }

    static async allPostsForCategory(category_id){
        const Post = require("../models/post.js");
        try{
            let [allPostsId] = await this.db.query(`SELECT * FROM post_categories WHERE categories_id = ?`, [category_id]);
            if (allPostsId.length === 0) { return false}; 
            
            console.log(allPostsId);

            let resultArray = [];
            for (const post of allPostsId){
                console.log(typeof Post);
                const newPost = new Post({});
                await newPost.findByProperty('id', post.post_id)
                resultArray.push(newPost.getLikeObject());
            }

            return resultArray;
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }
}
module.exports = Category;