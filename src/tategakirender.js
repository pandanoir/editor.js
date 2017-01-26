const eaw = require('eastasianwidth');
export const clearScreen = () => {
    const rows = process.stdout.rows;
    let clearer = '';
    for (let i = 0; i < rows; i++) {
        clearer += `\x1b[${i};1H\x1b[K`;
    }
    process.stdout.write('\x1b[H' + clearer + '\x1b[H');
};
export const writeStatusLine = (line) => {
    const write = process.stdout.write.bind(process.stdout);
    const columns = process.stdout.columns;
    write(
        '\x1b[47m' + // background color
        '\x1b[30m' + // text color
        line +
        ' '.repeat(columns - line.length)
    );
};
export const writeLines = (lines, _relativeCursor) => {
    const rows = process.stdout.rows - 1, // keep lines for header and footer
        columns = process.stdout.columns;
    const relativeCursor = {
        tate: _relativeCursor.x,
        yoko: _relativeCursor.y
    };

    lines = lines.slice(0, columns).map(line => [...line].slice(0, rows));
    const displayLines = [...Array(rows)].map(_ => Array(columns).fill(''));
    const lineWidth = [...Array(columns)].fill(0);
    for (let i = 0, _i = Math.min(columns, lines.length); i < _i; i++) {
        lineWidth[i] = 1;
        for (let j = 0, _j = Math.min(rows, lines[i].length); j < _j; j++) {
            lineWidth[i] = Math.max(lineWidth[i], eaw.characterLength(lines[i][j]));
        }
    }
    let lastLine = 0, lineSum = 0;
    for (let _i = Math.min(columns, lines.length); lastLine < _i; lastLine++) {
        if (lineSum + lineWidth[lastLine] > columns) break;
        lineSum += lineWidth[lastLine];
    }
    for (let i = 0; i < rows; i++) {
        process.stdout.write(' '.repeat(columns - lineSum));
        for (let j = lastLine - 1; j >= 0; j--) {
            if (relativeCursor.tate === i && relativeCursor.yoko === j) setCursorStyle();
            if (i >= lines[j].length) {
                process.stdout.write(' '.repeat(lineWidth[j]));
            } else {
                if (relativeCursor.tate === i && relativeCursor.yoko === j) setCursorStyle();
                if (!lines[j][i]) process.stdout.write(' '.repeat(lineWidth[j]));
                else process.stdout.write(' '.repeat(lineWidth[j] - eaw.characterLength(lines[j][i])) + lines[j][i]);
            }
            setStyle();
        }
        process.stdout.write('\n');
    }
};
export const setCursorStyle = () => {
    process.stdout.write('\x1b[41m'); // background color
    process.stdout.write('\x1b[37m'); // text color
};
export const setStyle = () => {
    process.stdout.write('\x1b[40m'); // background color
    process.stdout.write('\x1b[37m'); // text color
};
