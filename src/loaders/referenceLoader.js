async function insertDistinctValues(connection, tableName, columnName, values) {
    const rows = [...new Set(values)].map((value) => [value]);
    await connection.query(`INSERT INTO ${tableName} (${columnName}) VALUES ?`, [rows]);
}

async function readIdMap(connection, tableName, idColumn, nameColumn) {
    const [rows] = await connection.query(`SELECT ${idColumn}, ${nameColumn} FROM ${tableName}`);
    return new Map(rows.map((row) => [row[nameColumn], row[idColumn]]));
}

async function loadSeasons(connection, matches) {
    await insertDistinctValues(connection, 'season', 'label', matches.map((match) => match.seasonLabel));
    return readIdMap(connection, 'season', 'season_id', 'label');
}

async function loadTeams(connection, matches) {
    const teamNames = matches.flatMap((match) => match.sides.map((side) => side.teamName));
    await insertDistinctValues(connection, 'team', 'name', teamNames);
    return readIdMap(connection, 'team', 'team_id', 'name');
}

module.exports = { loadSeasons, loadTeams };
