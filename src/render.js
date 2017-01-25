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
export const writeLines = (lines, relativeCursor) => {
    const rows = process.stdout.rows - 1, // keep lines for header and footer
        columns = process.stdout.columns;
    lines = lines.slice(0, rows).map(line => line.slice(0, columns));
    for (let i = 0; i < rows; i++) {
        if (i >= lines.length) {
            process.stdout.write((' '.repeat(columns) + '\n').repeat(rows - i));
            break;
        }
        if (relativeCursor.y != i) {
            process.stdout.write(lines[i]);
            process.stdout.write(' '.repeat(columns - lines[i].length) + '\n');
        } else {
            if (lines[i].length > relativeCursor.x) {
                process.stdout.write(lines[i].slice(0, relativeCursor.x));
                setCursorStyle();
                process.stdout.write(lines[i].charAt(relativeCursor.x));
                setStyle();
                process.stdout.write(lines[i].slice(relativeCursor.x + 1));
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
