import {clearScreen, writeStatusLine, writeCommandLine, writeLines, setCursorStyle, setStyle} from './tategakirender.js';
import {NORMAL_MODE, INSERT_MODE, COMMAND_MODE} from './mode.js';
import State from './state.js';
const stdin = process.stdin;

let lines = [''];
let filename = process.argv[2] || '';
const cursor = {x: 0, y: 0};
const scroll = {x: 0, y: 0};
const getStatuslineText = () => `${['normal', 'insert', 'command'][State.mode]} [${filename === '' ? 'new file' : filename}] ${lines.length}lines scroll: (${scroll.x}, ${scroll.y}) cursor: (${cursor.x}, ${cursor.y})`;


if (filename != '') {
    const fs = require('fs');
    fs.readFile(filename, 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        lines = data.split('\n');
        if (lines.length >= 2) lines.pop(); // last is empty line.
        process.stdout.cork();
        clearScreen();
        setStyle();
        writeLines(lines.slice(scroll.y), {x: cursor.x - scroll.x, y: cursor.y - scroll.y});
        writeStatusLine(getStatuslineText());
        writeCommandLine(State.commandLineText);
        setTimeout(() =>{
            process.stdout.uncork();
        }, 1000/32);
    });
}
const DEFAULT_KEY = 'default_key_mapping';
const ESCAPE_KEY = '\u001b';
const ENTER_KEY = '\u000d';
const BACKSPACE_KEY = '\u007f';

const imap = {
    [ESCAPE_KEY]: () => {
            // esc
            State.mode = NORMAL_MODE;
            cursor.x--;
            if (cursor.x < 0) cursor.x = 0;
    },
    [ENTER_KEY]: () => {
        lines = lines.slice(0, cursor.y + 1).concat([lines[cursor.y].slice(cursor.x)]).concat(lines.slice(cursor.y + 1));
        lines[cursor.y] = lines[cursor.y].slice(0, cursor.x);
        cursor.x = 0;
        cursor.y++;
    },
    [BACKSPACE_KEY]: () => {
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
    },
    [DEFAULT_KEY]: key => {
        lines[cursor.y] = lines[cursor.y].slice(0, cursor.x) + key + lines[cursor.y].slice(cursor.x);
        cursor.x += [...key].length;
    }
}
const nmap = {
    'i': () => {
        State.mode = INSERT_MODE;
    },
    'a': () => {
        cursor.x++; State.mode = INSERT_MODE;
    },
    'o': () => {
        lines.splice(cursor.y + 1, 0, '');
        cursor.y++;
        cursor.x = 0;
        State.mode = INSERT_MODE;
    },
    'I': () => {
        cursor.x = 0;
        State.mode = INSERT_MODE;
    },
    'A': () => {
        cursor.x = lines[cursor.y].length;
        State.mode = INSERT_MODE;
    },
    'O': () => {
        lines.splice(cursor.y, 0, '');
        cursor.x = 0;
        State.mode = INSERT_MODE;
    },
    'q': () => {
        clearScreen();
        process.exit();
    },
    'h': () => {
        cursor.x--;
        cursor.y = Math.max(Math.min(lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(lines[cursor.y].length - 1, cursor.x), 0);
    },
    'j': () => {
        cursor.y++;
        cursor.y = Math.max(Math.min(lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(lines[cursor.y].length - 1, cursor.x), 0);
        const columns = process.stdout.columns - 1;
        if (lines.length >= scroll.y + 1 + columns && cursor.y >=  scroll.y + columns - 10) scroll.y++;
    },
    'k': () => {
        cursor.y--;
        cursor.y = Math.max(Math.min(lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(lines[cursor.y].length - 1, cursor.x), 0);
        if (scroll.y - 1 >= 0 && scroll.y + 10 >= cursor.y) scroll.y--;
    },
    'l': () => {
        cursor.x++;
        cursor.y = Math.max(Math.min(lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(lines[cursor.y].length - 1, cursor.x), 0);
    },
    ':': () =>  {
    }
        State.mode = COMMAND_MODE;
};
const nnoremap = {
    'k': nmap['h'],
    'h': nmap['j'],
    'l': nmap['k'],
    'j': nmap['l']
};
const cmap = {
    [ESCAPE_KEY]: () => {
        State.mode = NORMAL_MODE;
        cursor.x--;
        if (cursor.x < 0) cursor.x = 0;
    }
};

stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf-8');
stdin.on('data', key => {
    if (key === '\u0003') process.exit();
    const map = {
        [NORMAL_MODE]: [nnoremap, nmap],
        [INSERT_MODE]: [inoremap, imap],
        [COMMAND_MODE]: [cnoremap, cmap],
    }
    if (map[mode][0][key]) map[mode][0][key]();
    else if (map[mode][1][key]) map[mode][1][key]();
    else map[mode][1][DEFAULT_KEY](key);

    process.stdout.cork();
    clearScreen();
    setStyle();
    writeLines(lines.slice(scroll.y), {x: cursor.x - scroll.x, y: cursor.y - scroll.y});
    writeStatusLine(getStatuslineText());
    writeCommandLine(State.commandLineText);
    setTimeout(() =>{
        process.stdout.uncork();
    }, 1000/32);
});

const tweetBody = process.argv[2];
let count = 0;
process.stdout.cork();
setStyle();
writeLines(lines.slice(scroll.y), {x: cursor.x - scroll.x, y: cursor.y - scroll.y});
writeStatusLine(getStatuslineText());
writeCommandLine(State.commandLineText);
process.stdout.uncork();
