import {clearScreen} from './tategakirender.js';
import {DEFAULT_KEY, ESCAPE_KEY, ENTER_KEY, BACKSPACE_KEY} from './keys.js';
import {NORMAL_MODE, INSERT_MODE, COMMAND_MODE} from './mode.js';
import State from './state.js';

const cursor = State.cursor;
const scroll = State.scroll;

const range = (x, min, max) => {
    return Math.max(Math.min(x, max), min);
};
const moveCursor = (dx, dy) => {
    const repeater = parseInt(State.commandRepeater || '1', 10);
    if (State.commandRepeater != '') {
        dx *= repeater;
        dy *= repeater;
    }
    if (State.nextCommand != '' && commands[State.nextCommand]) commands[State.nextCommand](cursor.x, cursor.y, dx, dy);
    cursor.y = range(cursor.y + dy, 0, State.lines.length - 1);
    cursor.x = range(cursor.x + dx, 0, State.lines[cursor.y].length - 1);

    const rows = process.stdout.rows - 1;
    const columns = process.stdout.columns - 1;
    const scrollLimit = 10;
    if (repeater >= 50) {
        scroll.x = cursor.x - Math.floor(rows / 2);
        scroll.y = cursor.y - Math.floor(columns / 2);
    } else {
        if (cursor.x >= scroll.x + rows - scrollLimit) scroll.x = cursor.x - (rows - scrollLimit);
        else if (scroll.x + scrollLimit >= cursor.x) scroll.x = cursor.x - scrollLimit;

        if (cursor.y >= scroll.y + columns - scrollLimit) scroll.y = cursor.y - (columns - scrollLimit);
        else if (scroll.y + scrollLimit >= cursor.y) scroll.y = cursor.y - scrollLimit;
    }
    scroll.y = range(scroll.y, 0, State.lines.length - 1 - (columns - scrollLimit));
    scroll.x = range(scroll.x, 0, State.lines[cursor.y].length - 1 - (rows - scrollLimit));
    State.commandRepeater = '';
}

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
        moveCursor(-1, 0);
    },
    'j': () => {
        moveCursor(0, 1);
    },
    'k': () => {
        moveCursor(0, -1);
    },
    'l': () => {
        moveCursor(1, 0);
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
