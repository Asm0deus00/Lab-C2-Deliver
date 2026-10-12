const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { SELECTED_COLUMNS } = require('./selectedColumns');

const HEADER_LINE_OFFSET = 2;

function readSelectedRows(csvPath) {
    if (!fs.existsSync(csvPath)) {
        throw new Error(`No existe el archivo CSV: ${csvPath}`);
    }

    const records = parse(fs.readFileSync(csvPath, 'utf8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
    });

    if (records.length === 0) {
        throw new Error('El archivo CSV no contiene filas de datos');
    }

    const missingColumns = SELECTED_COLUMNS.filter((column) => !(column in records[0]));
    if (missingColumns.length > 0) {
        throw new Error(`Columnas ausentes en el CSV: ${missingColumns.join(', ')}`);
    }

    return records.map((record, index) => {
        const row = { lineNumber: index + HEADER_LINE_OFFSET };
        SELECTED_COLUMNS.forEach((column) => {
            row[column] = record[column];
        });
        return row;
    });
}

module.exports = { readSelectedRows };
