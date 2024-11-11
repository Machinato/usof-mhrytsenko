const Model = require("./model.js");

const TABLE_NAME = 'jwt_tokens';

class JWToken extends Model{
    static _tableName = TABLE_NAME

    constructor(token){
        super(TABLE_NAME, JWToken._fields);
        this.id = token.id || null;
        this.user_id = token.user_id || null;
        this.token = token.token || null;
    }

    static get _fields() {
        return ['id', 'user_id', 'token'];
    }

    static async saveToken(userId, refreshToken) {
        const newWebToken = new JWToken({"user_id": userId, "token": refreshToken});
        const tokenData = await newWebToken.findByProperty("user_id", userId);

        if(tokenData){
            newWebToken.token = refreshToken;

            const updateResult = await JWToken.updateById(newWebToken.id, {"token": refreshToken});

            console.log(`updateResult = ${updateResult.affectedRows}\nnewWebToken = ${newWebToken.id}`);
            if(updateResult){
                return true;
            }
        }
        
        const token = newWebToken.save();
        console.log(`newWebToken.save() result = ${token}`)
        return token;
    }
}

module.exports = JWToken;