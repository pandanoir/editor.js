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
        ' '.repeat(columns - line.length) +
        '\n'
    );
};
export const writeLines = (lines, cursor) => {
    const rows = process.stdout.rows - 2, // keep lines for header and footer
        columns = process.stdout.columns;
    for (let i = 0; i < rows; i++) {
        if (i >= lines.length) {
            process.stdout.write((' '.repeat(columns) + '\n').repeat(rows - i));
            break;
        }
        else if (cursor.y != i) {
            process.stdout.write(lines[i]);
            process.stdout.write(' '.repeat(columns - lines[i].length) + '\n');
        } else {
            if (lines[i].length > cursor.x) {
                process.stdout.write(lines[i].slice(0, cursor.x));
                setCursorStyle();
                process.stdout.write(lines[i].charAt(cursor.x));
                setStyle();
                process.stdout.write(lines[i].slice(cursor.x + 1));
                process.stdout.write(' '.repeat(columns - lines[i].length) + '\n');
            } else {
                process.stdout.write(lines[i]);
                setCursorStyle();
                process.stdout.write(' ');
                setStyle();
                process.stdout.write(' '.repeat(columns - (lines[i].length + 1)) + '\n');
            }
        }
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
