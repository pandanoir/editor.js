import {clearScreen} from './tategakirender.js';
import {DEFAULT_KEY, ESCAPE_KEY, ENTER_KEY, BACKSPACE_KEY} from './keys.js';
import {NORMAL_MODE, INSERT_MODE, COMMAND_MODE} from './mode.js';
import State from './state.js';

const cursor = State.cursor;
const scroll = State.scroll;

export const imap = {
    [ESCAPE_KEY]: () => {
            // esc
            State.mode = NORMAL_MODE;
            cursor.x--;
            if (cursor.x < 0) cursor.x = 0;
    },
    [ENTER_KEY]: () => {
        State.lines = State.lines.slice(0, cursor.y + 1).concat([State.lines[cursor.y].slice(cursor.x)]).concat(State.lines.slice(cursor.y + 1));
        State.lines[cursor.y] = State.lines[cursor.y].slice(0, cursor.x);
        cursor.x = 0;
        cursor.y++;
    },
    [BACKSPACE_KEY]: () => {
        if (cursor.x > 0) {
            State.lines[cursor.y] = State.lines[cursor.y].slice(0, cursor.x - 1) + State.lines[cursor.y].slice(cursor.x);
            cursor.x--;
        } else {
            if (cursor.y > 0) {
                const next_x = State.lines[cursor.y].length;
                State.lines[cursor.y - 1] += State.lines[cursor.y];
                State.lines = State.lines.slice(0, cursor.y).concat(State.lines.slice(cursor.y + 1));
                cursor.y--;
                cursor.x = State.lines[cursor.y].length - next_x;
            }
        }
    },
    [DEFAULT_KEY]: key => {
        State.lines[cursor.y] = State.lines[cursor.y].slice(0, cursor.x) + key + State.lines[cursor.y].slice(cursor.x);
        cursor.x += [...key].length;
    }
};
export const inoremap = {};
export const nmap = {
    'i': () => {
        State.mode = INSERT_MODE;
    },
    'a': () => {
        cursor.x++; State.mode = INSERT_MODE;
    },
    'o': () => {
        State.lines.splice(cursor.y + 1, 0, '');
        cursor.y++;
        cursor.x = 0;
        State.mode = INSERT_MODE;
    },
    'I': () => {
        cursor.x = 0;
        State.mode = INSERT_MODE;
    },
    'A': () => {
        cursor.x = State.lines[cursor.y].length;
        State.mode = INSERT_MODE;
    },
    'O': () => {
        State.lines.splice(cursor.y, 0, '');
        cursor.x = 0;
        State.mode = INSERT_MODE;
    },
    'q': () => {
        clearScreen();
        process.exit();
    },
    'h': () => {
        cursor.x--;
        cursor.y = Math.max(Math.min(State.lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(State.lines[cursor.y].length - 1, cursor.x), 0);
    },
    'j': () => {
        cursor.y++;
        cursor.y = Math.max(Math.min(State.lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(State.lines[cursor.y].length - 1, cursor.x), 0);
        const columns = process.stdout.columns - 1;
        if (State.lines.length >= scroll.y + 1 + columns && cursor.y >=  scroll.y + columns - 10) scroll.y++;
    },
    'k': () => {
        cursor.y--;
        cursor.y = Math.max(Math.min(State.lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(State.lines[cursor.y].length - 1, cursor.x), 0);
        if (scroll.y - 1 >= 0 && scroll.y + 10 >= cursor.y) scroll.y--;
    },
    'l': () => {
        cursor.x++;
        cursor.y = Math.max(Math.min(State.lines.length - 1, cursor.y), 0);
        cursor.x = Math.max(Math.min(State.lines[cursor.y].length - 1, cursor.x), 0);
    },
    ':': () =>  {
        State.mode = COMMAND_MODE;
        commandLine = ':';
    },
    [DEFAULT_KEY]: () => {}
};
for (let i = 1; i <= 9; i++) {
    nmap[`${i}`] = () => {
        State.commandRepeater += i;
    };
}
export const nnoremap = {
    'k': nmap['h'],
    'h': nmap['j'],
    'l': nmap['k'],
    'j': nmap['l']
};
export const cmap = {
    [ESCAPE_KEY]: () => {
        State.mode = NORMAL_MODE;
        cursor.x--;
        if (cursor.x < 0) cursor.x = 0;
    },
    [BACKSPACE_KEY]: () => {
        commandLine = commandLine.slice(0, -1);
        if (commandLine === '') State.mode = NORMAL_MODE;
    },
    [DEFAULT_KEY]: key => {
        commandLine += key;
    }
};
export const cnoremap = {};
