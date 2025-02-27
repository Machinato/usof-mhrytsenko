const mysql = require('mysql2');
const config = require('./config.json');

const pool = mysql.createPool({
    host : config.host,
    user : config.user,
    database : config.database,
    password : config.password,
    port : config.port
});

module.exports = pool.promise();