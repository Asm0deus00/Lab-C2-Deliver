const fs = require('fs');
const { readEnvironment } = require('./config/environment');
const { openConnection } = require('./database/connection');
const { readSelectedRows } = require('./csv/matchCsvReader');
const { validateMatchRow, ValidationError } = require('./validation/matchRowValidator');
const { clearTables } = require('./loaders/clearTables');
const { loadSeasons, loadTeams } = require('./loaders/referenceLoader');
const { loadMatches } = require('./loaders/matchLoader');

const REJECTED_LOG_PATH = 'rejected_rows.log';
const EXIT_CODE_REJECTED_ROWS = 2;
const EXIT_CODE_FATAL_ERROR = 1;

function validateRows(rows) {
    const validMatches = [];
    const rejected = [];
    const seenMatchKeys = new Set();

    rows.forEach((row) => {
        try {
            const match = validateMatchRow(row);
            const matchKey = [match.matchDate, ...match.sides.map((side) => side.teamName)].join('|');
            if (seenMatchKeys.has(matchKey)) {
                throw new ValidationError(`partido duplicado (${matchKey})`);
            }
            seenMatchKeys.add(matchKey);
            validMatches.push(match);
        } catch (error) {
            if (!(error instanceof ValidationError)) {
                throw error;
            }
            rejected.push({ lineNumber: row.lineNumber, reason: error.message });
        }
    });

    return { validMatches, rejected };
}

function reportRejected(rejected) {
    if (rejected.length === 0) {
        return;
    }
    const lines = rejected.map((item) => `linea ${item.lineNumber}: ${item.reason}`);
    fs.writeFileSync(REJECTED_LOG_PATH, `${lines.join('\n')}\n`);
    console.error(`Filas rechazadas: ${rejected.length}. Detalle en ${REJECTED_LOG_PATH}`);
}

async function main() {
    const environment = readEnvironment();
    const rows = readSelectedRows(environment.csvPath);
    const { validMatches, rejected: invalidRows } = validateRows(rows);

    const connection = await openConnection(environment.database);
    try {
        await connection.beginTransaction();
        await clearTables(connection);
        const seasonIds = await loadSeasons(connection, validMatches);
        const teamIds = await loadTeams(connection, validMatches);
        const { inserted, rejected: databaseRejected } = await loadMatches(
            connection,
            validMatches,
            seasonIds,
            teamIds
        );
        await connection.commit();

        const allRejected = [...invalidRows, ...databaseRejected];
        reportRejected(allRejected);
        console.log(`Filas leidas: ${rows.length}`);
        console.log(`Partidos cargados: ${inserted}`);
        console.log(`Temporadas: ${seasonIds.size}, equipos: ${teamIds.size}`);
        process.exitCode = allRejected.length > 0 ? EXIT_CODE_REJECTED_ROWS : 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error(`La carga fallo: ${error.message}`);
    process.exitCode = EXIT_CODE_FATAL_ERROR;
});
