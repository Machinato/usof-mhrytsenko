const db = require("../db.js");
// const Entity = require("./entity.js")

class Model {
    _tableName;
    _fields;

    constructor(tableName, fields = [id]) {
        this.db = db;
        this._tableName = tableName;
        this._fields = fields;
    }



    static get db() {
        return db;
    }

    static get _fields() {
        return [];
    }

    // Создание или обновление записи
    async save() {
        try {
            const fields = this.constructor._fields; // Берем поля из конкретного класса

            console.log(`get fields = ${fields}`);
            const placeholders = fields.map(() => '?').join(', ');
            const values = fields.map(field => this[field] !== undefined ? this[field] : null);

            console.log(`get values = ${values}`);

            const query = `INSERT INTO ${this._tableName} (${fields.join(', ')}) VALUES (${placeholders})`;

            // console.log(`-------------before save--------------`);
            const [result] = await this.db.execute(query, values);

            this.id = result.insertId; // Присваиваем id новому объекту

            console.log(`save result = ${result}`);

            return true;
        } catch (err) {
            console.error('Error in save:', err);
            throw new Error(`Failed to save data: ${err.sqlMessage}`);
        }
    }

    async findByProperty(property, value) {
        try {
            const allowedProperties = this._fields;

            if (!allowedProperties.includes(property)) {
                console.log(allowedProperties)
                throw new Error(`Invalid property ${property}`);
            }

            const [rows] = await this.db.execute(`SELECT * FROM ${this._tableName} WHERE ${property} = ?`, [value]);
            if (rows.length > 0) {
                Object.assign(this, rows[0]); // Заполняем свойства объекта
                return true;
            }

            return false;
        } catch (err) {
            console.error('Error in find:', err);
            throw new Error(`Invalid property ${property}`);
        }
    }

    // Удаление записи
    async delete() {
        if (!this.id) {
            throw new Error('No id provided for deletion');
        }
        try {
            await this.db.execute(`DELETE FROM ${this._tableName} WHERE id = ?`, [this.id]);
            return true;
        } catch (err) {
            console.error('Error in delete:', err);
            return false;
        }
    }

    // Поиск всех записей (с возможными условиями)
    static async findAll(conditions = {}) {
        // console.log(`Table name is: ${this._tableName}`);
        try {
            const keys = Object.keys(conditions);
            const whereClause = keys.length ? ' WHERE ' + keys.map(key => `${key} = ?`).join(' AND ') : '';
            const values = keys.map(key => conditions[key]);


            const [rows] = await db.execute(`SELECT * FROM ${this._tableName}${whereClause}`, values);

            return rows;
        } catch (err) {
            console.error('Error in findAll:', err);
            return [];
        }
    }

    static async updateById(userId, userData) {
        try {
            const fields = [];
            const values = [];
            // const setClause = [];

            const allowedProperties = this._fields;

            for (let field in userData) {
                // console.log(`field = ${field}`)
                if (!allowedProperties.includes(field)) {
                    throw new Error('Invalid property');
                }

                if (field !== 'id' || !userData[field]) {
                    console.log(`${field} = ${userData[field]}`)

                    fields.push(`${field} = ?`);
                    values.push(userData[field]);
                }
                else {
                    console.log(`no update field = ${field}`)
                }
            }

            values.push(userId);

            console.log(`updateById: fields = ${fields}`)
            console.log(`updateById: values = ${values}`)

            const query = `UPDATE ${this._tableName} SET ${fields.join(', ')} WHERE id = ?`;

            const [result] = await this.db.query(query, values);
            return result;
        } catch (err) {
            throw err;
        }
    }

    getLikeObject() {
        const result = {};

        this._fields.forEach(field => {
            if (
                this[field] !== undefined ||
                this[field] !== "_fields" ||
                this[field] !== "_tableName"
            ) {
                this.delete.db;
                result[field] = this[field]
            }
        });

        return result;
    }
}

module.exports = Model;
