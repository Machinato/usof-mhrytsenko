const bcrypt = require('bcrypt');
const saltRounds = 1; // Более безопасное значение

    function sendResponse(res, statusCode, success, message, data = null, errors = null) {
        return res.status(statusCode).json({ success, message, data, errors });
    }

    async function hashPassword(password) {
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log(`Original password: ${password}`);
            console.log(`Hashed password: ${hashedPassword}`);
            return hashedPassword;
        } catch (error) {
            console.error("Error hashing password:", error);
            throw new Error("Password hashing failed");
        }
    }

    async function executeWithTryCatch(res, asyncFunc) {
        return async (req, res, next) => {
            try {
                await asyncFunc(req, res, next);
            } catch (err) {
                console.error("Error in async function:", err);
                return res.status(500).json({ success: false, message: "Internal server error", errors: err.message });
            }
        };
    }

module.exports = {
    sendResponse,
    hashPassword,
    executeWithTryCatch
};
