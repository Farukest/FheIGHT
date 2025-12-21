"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChromaLink_1 = require("./ChromaLink");
const Headset_1 = require("./Headset");
const Keyboard_1 = require("./Keyboard");
const Keypad_1 = require("./Keypad");
const Mouse_1 = require("./Mouse");
const Mousepad_1 = require("./Mousepad");
class DeviceContainer {
    constructor() {
        this.Keyboard = new Keyboard_1.default();
        this.Mousepad = new Mousepad_1.default();
        this.Mouse = new Mouse_1.default();
        this.Keypad = new Keypad_1.default();
        this.Headset = new Headset_1.default();
        this.ChromaLink = new ChromaLink_1.default();
        this.AnimationId = "";
        this.Devices = [];
        this.Devices.push(this.Keyboard, this.Mousepad, this.Mouse, this.Keypad, this.Headset, this.ChromaLink);
    }
    setAll(color) {
        this.Devices.forEach((device) => {
            device.setAll(color);
        });
    }
    setNone() {
        this.Devices.forEach((device) => {
            device.setNone();
        });
    }
}
exports.default = DeviceContainer;
//# sourceMappingURL=index.js.map