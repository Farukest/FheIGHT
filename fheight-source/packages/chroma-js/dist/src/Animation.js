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
exports.Animation = void 0;
const AnimationFrame_1 = require("./AnimationFrame");
const Color_1 = require("./Color");
const DeviceRequestData_1 = require("./DeviceRequestData");
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
class Animation {
    constructor() {
        this.Frames = [];
        this.isPlaying = false;
        this.Instance = null;
        this.currentFrame = 0;
        this.isInit = false;
    }
    play(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isInit) {
                this.isInit = true;
                yield this.createFrames();
            }
            this.Instance = instance;
            this.isPlaying = true;
            this.currentFrame = 0;
            yield this.createEffects(instance);
            this.playLoop(instance);
        });
    }
    playLoop(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const i of this.Frames) {
                yield instance.send(i);
                yield sleep(i.delay);
                if (!this.isPlaying) {
                    break;
                }
            }
            if (this.isPlaying) {
                this.playLoop(instance);
            }
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            this.isPlaying = false;
            const effectIds = [];
            for (const frame of this.Frames) {
                if (frame.Keyboard.effectId !== "") {
                    effectIds.push(frame.Keyboard.effectId);
                }
                frame.Keyboard.effectId = "";
            }
            yield this.Instance.deleteEffect(effectIds);
        });
    }
    createEffects(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            this.Instance = instance;
            const keyboardEffectData = [];
            const device = new DeviceRequestData_1.DeviceRequestData();
            device.device = "keyboard";
            for (const frame of this.Frames) {
                keyboardEffectData.push(frame.Keyboard.effectData);
            }
            device.effectData = {
                effects: keyboardEffectData,
            };
            const response = yield instance.sendDeviceUpdate([device], true);
            const keyboardids = response[0];
            for (let i = 0; i < keyboardids.length; i++) {
                this.Frames[i].Keyboard.effectId = keyboardids[i] !== null ? keyboardids[i].id : "";
            }
            return;
        });
    }
    createFrames() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 10; i++) {
                const frame = new AnimationFrame_1.AnimationFrame();
                frame.Keyboard.setAll(new Color_1.default("ff0000"));
                this.Frames.push(frame);
            }
        });
    }
}
exports.Animation = Animation;
//# sourceMappingURL=Animation.js.map