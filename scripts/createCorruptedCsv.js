const fs = require('fs');
const { readEnvironment } = require('../src/config/environment');

const OUTPUT_PATH = 'data/football_matches_corrupted.csv';
const FIRST_DATA_LINE_INDEX = 1;
const DUPLICATED_LINE_INDEX = 5;

function setField(lines, lineIndex, header, columnName, value) {
    const fields = lines[lineIndex].split(',');
    fields[header.indexOf(columnName)] = value;
    lines[lineIndex] = fields.join(',');
}

function main() {
    const { csvPath } = readEnvironment();
    const lines = fs.readFileSync(csvPath, 'utf8').trimEnd().split(/\r?\n/);
    const header = lines[0].split(',');
    const first = FIRST_DATA_LINE_INDEX;

    setField(lines, first, header, 'goal_home_ft', 'abc');
    setField(lines, first + 1, header, 'home_possession', '150');
    setField(lines, first + 2, header, 'away_team', lines[first + 2].split(',')[header.indexOf('home_team')]);
    setField(lines, first + 3, header, 'date', '2010-13-45');
    lines.push(lines[DUPLICATED_LINE_INDEX]);

    fs.writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`);
    console.log(`Archivo alterado generado en ${OUTPUT_PATH}`);
}

main();
