#!/usr/bin/env node
const clearScreen = () => {
    const rows = process.stdout.rows;
    let clearer = '';
    for (let i = 0; i < rows; i++) {
        clearer += `\x1b[${i};1H\x1b[K`;
    }
    process.stdout.write('\x1b[H' + clearer + '\x1b[H');
};
const writeStatusLine = (line) => {
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
const writeLines = (lines, cursor) => {
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
const setCursorStyle = () => {
    process.stdout.write('\x1b[41m'); // background color
    process.stdout.write('\x1b[37m'); // text color
};
const setStyle = () => {
    process.stdout.write('\x1b[40m'); // background color
    process.stdout.write('\x1b[37m'); // text color
};

const NORMAL_MODE = 0;
const INSERT_MODE = 1;
const COMMAND_MODE = 2;
const stdin = process.stdin;
let mode = NORMAL_MODE;
let lines = [''];
let filename = '';
const cursor = {x: 0, y: 0};


stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf-8');
stdin.on('data', key => {
    if (key === '\u0003') process.exit();
    if (mode === INSERT_MODE) {
        if (key === '\u001b') {
            // esc
            mode = NORMAL_MODE;
            cursor.x--;
            if (cursor.x < 0) cursor.x = 0;
        } else if (key === '\u000d') {
            // new line
            lines = lines.slice(0, cursor.y + 1).concat([lines[cursor.y].slice(cursor.x)]).concat(lines.slice(cursor.y + 1));
            lines[cursor.y] = lines[cursor.y].slice(0, cursor.x);
            cursor.x = 0;
            cursor.y++;
        } else if (key === '\u007f') {
            // backspace
            if (cursor.x > 0) {
                lines[cursor.y] = lines[cursor.y].slice(0, cursor.x - 1) + lines[cursor.y].slice(cursor.x);
                cursor.x--;
            } else {
                if (cursor.y > 0) {
                    const next_x = lines[cursor.y].length;
                    lines[cursor.y - 1] += lines[cursor.y];
                    lines = lines.slice(0, cursor.y).concat(lines.slice(cursor.y + 1));
                    cursor.y--;
                    cursor.x = lines[cursor.y].length - next_x;
                }
            }
        } else {
            lines[cursor.y] = lines[cursor.y].slice(0, cursor.x) + key + lines[cursor.y].slice(cursor.x);
            cursor.x += [...key].length;
        }
    } else if (mode === NORMAL_MODE) {
        if (key === 'i') mode = INSERT_MODE;
        if (key === 'a') {cursor.x++; mode = INSERT_MODE;}
        if (key === 'o') {
            lines.splice(cursor.y + 1, 0, '');
            cursor.y++;
            cursor.x = 0;
            mode = INSERT_MODE;
        }
        if (key === 'q') {clearScreen();process.exit();}
        if ('hjkl'.includes(key)) {
            if (key === 'h') cursor.x--;
            if (key === 'j') cursor.y++;
            if (key === 'k') cursor.y--;
            if (key === 'l') cursor.x++;
            cursor.y = Math.max(Math.min(lines.length - 1, cursor.y), 0);
            cursor.x = Math.max(Math.min(lines[cursor.y].length - 1, cursor.x), 0);
        }
        if (key === ':') {
            mode = COMMAND_MODE;
        }
    } else if (mode === COMMAND_MODE) {
        if (key === '\u001b') {
            // esc
            mode = NORMAL_MODE;
            cursor.x--;
            if (cursor.x < 0) cursor.x = 0;
        }
    }
    process.stdout.cork();
    clearScreen();
    setStyle();
    writeLines(lines, cursor);
    writeStatusLine(`${['normal', 'insert', 'command'][mode]} [${filename === '' ? 'new file' : filename}]`);
    setTimeout(() =>{
        process.stdout.uncork();
    }, 1000/32);
});

process.stdout.cork();
setStyle();
writeLines(lines, cursor);
writeStatusLine(`${['normal', 'insert', 'command'][mode]} [${filename === '' ? 'new file' : filename}]`);
process.stdout.uncork();
