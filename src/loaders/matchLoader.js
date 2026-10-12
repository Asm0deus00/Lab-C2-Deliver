const SAVEPOINT_NAME = 'before_match';

async function insertMatch(connection, match, seasonIds, teamIds) {
    const [matchResult] = await connection.query(
        'INSERT INTO football_match (season_id, match_date) VALUES (?, ?)',
        [seasonIds.get(match.seasonLabel), match.matchDate]
    );

    const statsRows = match.sides.map((side) => [
        matchResult.insertId,
        teamIds.get(side.teamName),
        side.venue,
        side.goals,
        side.possession,
        side.shotsOnTarget,
        side.redCards
    ]);

    await connection.query(
        `INSERT INTO team_match_stats
            (match_id, team_id, venue, goals, possession, shots_on_target, red_cards)
         VALUES ?`,
        [statsRows]
    );
}

async function loadMatches(connection, matches, seasonIds, teamIds) {
    const rejected = [];
    let inserted = 0;

    for (const match of matches) {
        await connection.query(`SAVEPOINT ${SAVEPOINT_NAME}`);
        try {
            await insertMatch(connection, match, seasonIds, teamIds);
            inserted += 1;
        } catch (error) {
            await connection.query(`ROLLBACK TO SAVEPOINT ${SAVEPOINT_NAME}`);
            rejected.push({
                lineNumber: match.lineNumber,
                reason: `${error.code || 'DB_ERROR'}: ${error.message}`
            });
        }
    }

    return { inserted, rejected };
}

module.exports = { loadMatches };
