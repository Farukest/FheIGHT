"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveAnimation = void 0;
const Animation_1 = require("../Animation");
const AnimationFrame_1 = require("../AnimationFrame");
const Color_1 = require("../Color");
const Keyboard_1 = require("../Devices/Keyboard");
class WaveAnimation extends Animation_1.Animation {
    constructor(rightToLeft = true) {
        super();
        this.rightToLeft = rightToLeft;
    }
    createFrames() {
        return __awaiter(this, void 0, void 0, function* () {
            const frequency = 1;
            const rainbow = [];
            for (let num = 0; num < Math.PI * 2; num += (Math.PI * 2 / 22)) {
                const red = Math.cos(num) * 255 / 2 + 255 / 2;
                const green = Math.cos(num + Math.PI) * 255 / 2 + 255 / 2;
                const blue = Math.sin(num) * 255 / 2 + 255 / 2;
                const color = new Color_1.Color(red, blue, green);
                rainbow.push(color);
            }
            for (const rainbowStep of rainbow) {
                const frame = new AnimationFrame_1.AnimationFrame();
                for (let c = 0; c < Keyboard_1.Keyboard.Columns; ++c) {
                    frame.Keyboard.setCol(c, rainbowStep);
                }
                if (this.rightToLeft) {
                    const first = rainbow.shift();
                    rainbow.push(first);
                }
                else {
                    const first = rainbow.pop();
                    rainbow.unshift(first);
                }
                this.Frames.push(frame);
            }
        });
    }
}
exports.WaveAnimation = WaveAnimation;
//# sourceMappingURL=WaveAnimation.js.map