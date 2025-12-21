"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../Effect");
const Grid_1 = require("../Grid");
const Base_1 = require("./Base");
class Keypad extends Base_1.default {
    constructor() {
        super();
        this.device = "keypad";
        this.grid = new Grid_1.default(4, 5);
    }
    setAll(color) {
        this.grid.set(color);
        this.set();
        return this;
    }
    setPosition(r, c, color) {
        this.grid.setPosition(r, c, color);
        this.set();
        return this;
    }
    set() {
        this.setDeviceEffect(Effect_1.default.CHROMA_CUSTOM, this.grid.grid);
        return this;
    }
}
exports.default = Keypad;
//# sourceMappingURL=Keypad.js.map