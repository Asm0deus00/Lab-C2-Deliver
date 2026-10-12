const SEASON_PATTERN = /^\d{2}\/\d{2}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_POSSESSION_SUM_DEVIATION = 0.5;
const FULL_POSSESSION = 100;

class ValidationError extends Error {}

function parseNonNegativeInteger(value, fieldName) {
    if (!/^\d+$/.test(value)) {
        throw new ValidationError(`${fieldName} debe ser un entero no negativo (recibido: "${value}")`);
    }
    return Number(value);
}

function parsePossession(value, fieldName) {
    const possession = Number(value);
    if (value === '' || Number.isNaN(possession) || possession < 0 || possession > FULL_POSSESSION) {
        throw new ValidationError(`${fieldName} debe estar entre 0 y 100 (recibido: "${value}")`);
    }
    return possession;
}

function parseTeamName(value, fieldName) {
    if (!value) {
        throw new ValidationError(`${fieldName} es obligatorio`);
    }
    return value;
}

function parseSeason(value) {
    if (!SEASON_PATTERN.test(value)) {
        throw new ValidationError(`season con formato invalido (recibido: "${value}")`);
    }
    return value;
}

function parseMatchDate(value) {
    const isCalendarDate = DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(value));
    if (!isCalendarDate) {
        throw new ValidationError(`date con formato invalido (recibido: "${value}")`);
    }
    return value;
}

function buildTeamSide(row, venue, goalsField) {
    return {
        venue,
        teamName: parseTeamName(row[`${venue}_team`], `${venue}_team`),
        goals: parseNonNegativeInteger(row[goalsField], goalsField),
        possession: parsePossession(row[`${venue}_possession`], `${venue}_possession`),
        shotsOnTarget: parseNonNegativeInteger(row[`${venue}_shots_on_target`], `${venue}_shots_on_target`),
        redCards: parseNonNegativeInteger(row[`${venue}_red_cards`], `${venue}_red_cards`)
    };
}

function validateMatchRow(row) {
    const home = buildTeamSide(row, 'home', 'goal_home_ft');
    const away = buildTeamSide(row, 'away', 'goal_away_ft');

    if (home.teamName === away.teamName) {
        throw new ValidationError('el equipo local y el visitante no pueden ser el mismo');
    }

    const possessionSum = home.possession + away.possession;
    if (Math.abs(possessionSum - FULL_POSSESSION) > MAX_POSSESSION_SUM_DEVIATION) {
        throw new ValidationError(`la posesion de ambos equipos suma ${possessionSum}, se esperaba 100`);
    }

    return {
        lineNumber: row.lineNumber,
        seasonLabel: parseSeason(row.season),
        matchDate: parseMatchDate(row.date),
        sides: [home, away]
    };
}

module.exports = { validateMatchRow, ValidationError };
