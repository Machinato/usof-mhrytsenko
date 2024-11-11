const { sendResponse } = require('../service/helperFunction');
const jwt = require('jsonwebtoken');
const { SECRET_ACCESS } = require('../config.json');

module.exports = function (restrictedFields = {}) {
    return function (req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return sendResponse(res, 403, false, "User not authorized");
            }
            const decodedData = jwt.verify(token, SECRET_ACCESS);
            const userRole = decodedData.roles;
            const updatedFields = req.body;
            const restricted = restrictedFields[userRole];

            if (restricted) {
                for (let field in updatedFields) {
                    if (restricted.includes(field)) {
                        return sendResponse(res, 403, false, `You are not allowed to change the ${field} field`);
                    }
                }
            }

            next();
        } catch (err) {
            console.log(err);
            return sendResponse(res, 500, false, "Error verifying user role", null, err.message);
        }
    };
};
