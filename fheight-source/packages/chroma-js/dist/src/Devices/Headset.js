"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
class Headset extends Base_1.default {
    constructor() {
        super();
        this.device = "headset";
        this.supports = ["CHROMA_NONE", "CHROMA_CUSTOM", "CHROMA_STATIC"];
    }
}
exports.default = Headset;
//# sourceMappingURL=Headset.js.map