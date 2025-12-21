"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../Effect");
const Grid_1 = require("../Grid");
const Base_1 = require("./Base");
class Mousepad extends Base_1.default {
    constructor() {
        super();
        this.device = "mousepad";
        this.grid = new Grid_1.default(1, 15);
    }
    setAll(color) {
        this.grid.set(color);
        this.set();
        return this;
    }
    setPosition(c, color) {
        this.grid.setPosition(0, c, color);
        this.set();
        return this;
    }
    set() {
        this.setDeviceEffect(Effect_1.default.CHROMA_CUSTOM, this.grid.grid[0]);
        return this;
    }
}
exports.default = Mousepad;
//# sourceMappingURL=Mousepad.js.map