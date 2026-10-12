const mysql = require('mysql2/promise');

async function openConnection(databaseConfig) {
    return mysql.createConnection(databaseConfig);
}

module.exports = { openConnection };
