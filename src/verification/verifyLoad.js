const { readEnvironment } = require('../config/environment');
const { openConnection } = require('../database/connection');
const { readSelectedRows } = require('../csv/matchCsvReader');

const TABLES = ['season', 'team', 'football_match', 'team_match_stats'];
const STATS_ROWS_PER_MATCH = 2;

async function countRows(connection, tableName) {
    const [[row]] = await connection.query(`SELECT COUNT(*) AS total FROM ${tableName}`);
    return row.total;
}

async function countMatchesWithoutBothSides(connection) {
    const [[row]] = await connection.query(
        `SELECT COUNT(*) AS total
         FROM football_match m
         LEFT JOIN team_match_stats s ON s.match_id = m.match_id
         GROUP BY m.match_id
         HAVING COUNT(DISTINCT s.venue) <> ?
         LIMIT 1`,
        [STATS_ROWS_PER_MATCH]
    );
    return row ? row.total : 0;
}

async function main() {
    const environment = readEnvironment();
    const csvRowCount = readSelectedRows(environment.csvPath).length;
    const connection = await openConnection(environment.database);

    try {
        const counts = {};
        for (const tableName of TABLES) {
            counts[tableName] = await countRows(connection, tableName);
            console.log(`${tableName}: ${counts[tableName]}`);
        }
        console.log(`Filas del CSV: ${csvRowCount}`);

        const incompleteMatches = await countMatchesWithoutBothSides(connection);
        const isConsistent =
            counts.football_match === csvRowCount &&
            counts.team_match_stats === csvRowCount * STATS_ROWS_PER_MATCH &&
            incompleteMatches === 0;

        console.log(isConsistent ? 'Verificacion exitosa' : 'Verificacion fallida: conteos inconsistentes');
        process.exitCode = isConsistent ? 0 : 1;
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error(`La verificacion fallo: ${error.message}`);
    process.exitCode = 1;
});
