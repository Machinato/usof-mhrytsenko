const {sendResponse} = require('../service/helperFunction');
const jwt = require('jsonwebtoken');
const {SECRET_ACCESS, SECRET_REFRESH} = require('../config.json');

module.exports = function (req, res, next) {
    if(req.method === "OPTIONS"){
        next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            return sendResponse(res, 403, false, "User not authorized")
        }
        const decData = jwt.verify(token, SECRET_ACCESS);
        
        req.user = decData;
        next();
    }
    catch (e){
        console.log(e);
        return sendResponse(res, 403, false, "User not authorized")
    } 
};