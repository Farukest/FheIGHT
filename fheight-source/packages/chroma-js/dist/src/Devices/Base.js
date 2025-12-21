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
const Effect_1 = require("../Effect");
function parseEffectData(effect, data) {
    let jsonObj = null;
    if (effect === Effect_1.default.CHROMA_NONE) {
        jsonObj = { effect };
    }
    else if (effect === Effect_1.default.CHROMA_CUSTOM
        || effect === Effect_1.default.CHROMA_CUSTOM2
        || effect === Effect_1.default.CHROMA_CUSTOM_KEY) {
        jsonObj = { effect, param: data };
    }
    else if (effect === Effect_1.default.CHROMA_STATIC) {
        const color = { color: data };
        jsonObj = { effect, param: color };
    }
    return jsonObj;
}
class DeviceBase {
    constructor() {
        this.activeEffect = Effect_1.default.UNDEFINED;
        this.effectData = null;
        this.effectId = "";
        this.setStatic = this.setStatic.bind(this);
        this.setDeviceEffect = this.setDeviceEffect.bind(this);
        this.setAll = this.setAll.bind(this);
        this.setNone = this.setNone.bind(this);
        this.set = this.set.bind(this);
    }
    setStatic(color) {
        this.setDeviceEffect(Effect_1.default.CHROMA_STATIC, color);
        return this;
    }
    setAll(color) {
        this.setStatic(color);
        return this;
    }
    set() {
        // console.log("Test");
    }
    setNone() {
        this.setDeviceEffect(Effect_1.default.CHROMA_NONE);
    }
    setDeviceEffect(effect, data = null) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeEffect = effect;
            this.effectData = parseEffectData(effect, data);
        });
    }
}
exports.default = DeviceBase;
//# sourceMappingURL=Base.js.map