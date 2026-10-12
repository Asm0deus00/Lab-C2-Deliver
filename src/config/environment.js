require('dotenv').config();

const REQUIRED_VARIABLES = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'CSV_PATH'
];

function readEnvironment() {
    const missing = REQUIRED_VARIABLES.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
    }

    return {
        database: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        csvPath: process.env.CSV_PATH
    };
}

module.exports = { readEnvironment };
