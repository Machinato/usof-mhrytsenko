const Model = require("./model.js");

class Token extends Model{
    constructor(){
        super();
    }

    static async findUserByTokenAndTermCheck(token){
        const [rows] = await this.db.query(
            `SELECT tokens.* FROM tokens  
        WHERE tokens.token = ?`, [token]);
            
        if (rows.length === 0){
            console.log(`false length = 0`);
            return false;
        }
        else{
            const expirationDate = new Date(rows[0].expiration_date).getTime();
            const currentDate = new Date().getTime();

            // console.log(`expirationDate: ${expirationDate}`);
            // console.log(`currentDate: ${currentDate}`);
            if(expirationDate < currentDate){
                console.log(`false expirationDate < currentDate`);
                return false;
            }
            else{
                console.log(`true`);
                return true;
            }
        }
    }

    static async userId(token){
        const [rows] = await this.db.query(
            `SELECT tokens.* FROM tokens  
        WHERE tokens.token = ?`, [token]);
            
        if (rows.length === 0){
            return false;
        }
        else{
            return rows[0].user_id;
        }
    }

    static async addTokenToDB(userId, token, expirationDate){
        try{
            const [rows] = await this.db.query('SELECT tokens.* FROM tokens WHERE tokens.user_id = ?', [userId]);
            if(rows.length !== 0){
                const [updateTokenResult] = await this.db.query(`UPDATE tokens SET token = ?, expiration_date = ? WHERE user_id = ?;`,
                [token, expirationDate, userId]);
                console.log(expirationDate)
                console.log("token update")

                return true;
            }
            else{
                const [insertTokenResult] = await this.db.query('INSERT INTO tokens (user_id, token, expiration_date) VALUE (?, ?, ?)', 
                [userId, token, expirationDate]);
                    
                console.log("token insert")

                return true;
            }
        }
        catch(err){
            console.error(err);
            throw err;
        }
    }

    static async delete(userId) {
        try {
            const result = await this.db.query('DELETE FROM tokens WHERE user_id = ?', [userId]);
            return result[0].affectedRows > 0;

        } catch (err) {
            console.error(err);
            throw err;
        }
    }
}

module.exports = Token;