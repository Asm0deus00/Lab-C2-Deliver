const TABLES_IN_DELETE_ORDER = ['team_match_stats', 'football_match', 'team', 'season'];

async function clearTables(connection) {
    for (const tableName of TABLES_IN_DELETE_ORDER) {
        await connection.query(`DELETE FROM ${tableName}`);
    }
}

module.exports = { clearTables };
