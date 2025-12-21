"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
const Color_1 = require("../Color");
const Effect_1 = require("../Effect");
const Grid_1 = require("../Grid");
const Base_1 = require("./Base");
class Keyboard extends Base_1.default {
    constructor() {
        super();
        this.device = "keyboard";
        this.grid = new Grid_1.default(Keyboard.Rows, Keyboard.Columns, Color_1.default.Black);
        this.keys = new Grid_1.default(Keyboard.Rows, Keyboard.Columns, Color_1.default.Black);
        this.setKey = this.setKey.bind(this);
    }
    setAll(color) {
        this.grid.set(color);
        this.keys.set(Color_1.default.Black);
        this.set();
        return this;
    }
    setRow(r, color) {
        this.grid.setRow(r, color);
        this.set();
        return this;
    }
    setCol(c, color) {
        this.grid.setCol(c, color);
        this.set();
        return this;
    }
    setPosition(r, c, color) {
        color.isKey = false;
        this.grid.setPosition(r, c, color);
        this.set();
        return this;
    }
    setKey(keyOrArrayOfKeys, color) {
        if (keyOrArrayOfKeys instanceof Array) {
            const keyarray = keyOrArrayOfKeys;
            keyOrArrayOfKeys.forEach((element) => {
                this.setKey(element, color);
            });
            return this;
        }
        else {
            const row = keyOrArrayOfKeys >> 8; // tslint:disable-line:no-bitwise
            const col = keyOrArrayOfKeys & 0xFF; // tslint:disable-line:no-bitwise
            color.isKey = true;
            this.keys.setPosition(row, col, color);
            return this;
        }
    }
    set() {
        this.setDeviceEffect(Effect_1.default.CHROMA_CUSTOM_KEY, {
            color: this.grid,
            key: this.keys,
        });
        return this;
    }
}
exports.Keyboard = Keyboard;
Keyboard.Columns = 22;
Keyboard.Rows = 6;
exports.default = Keyboard;
//# sourceMappingURL=Keyboard.js.map