import {clearScreen, writeStatusLine, writeCommandLine, writeLines, setCursorStyle, setStyle} from './tategakirender.js';
import {NORMAL_MODE, INSERT_MODE, COMMAND_MODE} from './mode.js';
import {nnoremap, nmap, inoremap, imap, cnoremap, cmap} from './map.js';
import State from './state.js';
import {DEFAULT_KEY} from './keys.js';

State.filename = process.argv[2] || '';
const cursor = State.cursor;
const scroll = State.scroll;

const stdin = process.stdin;
const getStatuslineText = () => `${['normal', 'insert', 'command'][State.mode]} [${State.filename || 'new file'}] ${State.lines.length}lines scroll: (${scroll.x}, ${scroll.y}) cursor: (${cursor.x}, ${cursor.y})`;

if (State.filename != '') {
    const fs = require('fs');
    fs.readFile(State.filename, 'utf-8', (err, data) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        State.lines = data.split('\n');
        if (State.lines.length >= 2) State.lines.pop(); // last is empty line.
        process.stdout.cork();
        clearScreen();
        setStyle();
        writeLines(State.lines.slice(scroll.y), {x: cursor.x - scroll.x, y: cursor.y - scroll.y});
        writeStatusLine(getStatuslineText());
        writeCommandLine(State.commandLineText);
        setTimeout(() =>{
            process.stdout.uncork();
        }, 1000/32);
    });
}

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
    if (map[State.mode][0][key]) map[State.mode][0][key]();
    else if (map[State.mode][1][key]) map[State.mode][1][key]();
    else map[State.mode][1][DEFAULT_KEY](key);

    process.stdout.cork();
    clearScreen();
    setStyle();
    writeLines(State.lines, {x: cursor.x - scroll.x, y: cursor.y - scroll.y});
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
writeLines(State.lines, {x: cursor.x - scroll.x, y: cursor.y - scroll.y});
writeStatusLine(getStatuslineText());
writeCommandLine(State.commandLineText);
process.stdout.uncork();
