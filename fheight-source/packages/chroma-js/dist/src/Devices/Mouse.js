"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Effect_1 = require("../Effect");
const Grid_1 = require("../Grid");
const Base_1 = require("./Base");
class Mouse extends Base_1.default {
    constructor() {
        super();
        this.device = "mouse";
        this.grid = new Grid_1.default(9, 7);
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
        this.setDeviceEffect(Effect_1.default.CHROMA_CUSTOM2, this.grid.grid);
        return this;
    }
}
exports.default = Mouse;
//# sourceMappingURL=Mouse.js.map