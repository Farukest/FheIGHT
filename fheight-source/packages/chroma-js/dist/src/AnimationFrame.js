"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationFrame = void 0;
const Devices_1 = require("./Devices");
class AnimationFrame extends Devices_1.default {
    constructor() {
        super(...arguments);
        this.delay = 1000 / 15;
    }
}
exports.AnimationFrame = AnimationFrame;
//# sourceMappingURL=AnimationFrame.js.map