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
exports.ChromaInstance = void 0;
const request_1 = require("./request");
const Devices_1 = require("./Devices");
const Effect_1 = require("./Effect");
class ChromaInstance extends Devices_1.default {
    constructor(url) {
        super();
        this.destroyed = false;
        this.activeAnimation = null;
        this.url = url;
        this.heartbeat = this.heartbeat.bind(this);
        this.setAll = this.setAll.bind(this);
        this.destroy = this.destroy.bind(this);
        this.interval = setInterval(this.heartbeat, 10000);
    }
    playAnimation(animation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stopAnimation();
            this.activeAnimation = animation;
            yield animation.play(this);
            return animation;
        });
    }
    stopAnimation() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activeAnimation !== null) {
                yield this.activeAnimation.stop();
                this.activeAnimation = null;
            }
            return;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this.destroyed = true;
            clearInterval(this.interval);
            this.interval = null;
            const url = this.url;
            this.url = "";
            const response = yield (0, request_1.default)(url, {
                method: "delete",
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return true;
        });
    }
    heartbeat() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.url === "") {
                return;
            }
            const response = yield (0, request_1.default)(this.url + "/heartbeat", {
                method: "put",
            });
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response;
        });
    }
    send(container = this) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.url === "") {
                return;
            }
            const devices = [];
            const effectids = [];
            for (const device of container.Devices) {
                if (device.activeEffect === Effect_1.default.UNDEFINED) {
                    continue;
                }
                if (device.effectId !== "") {
                    effectids.push(device.effectId);
                }
                else {
                    devices.push(device);
                }
            }
            this.setEffect(effectids);
            return yield this.sendDeviceUpdate(devices, false);
        });
    }
    sendDeviceUpdate(devices, store = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = [];
            for (const device of devices) {
                const name = device.device;
                const parsedData = device.effectData;
                const deviceresponse = yield (0, request_1.default)(this.url + "/" + name, {
                    body: JSON.stringify(parsedData),
                    headers: { "Content-Type": "application/json" },
                    method: (store) ? "post" : "put",
                });
                if (!deviceresponse.ok) {
                    throw Error(deviceresponse.statusText);
                }
                const data = yield deviceresponse.json();
                response.push(data.results);
            }
            return response;
        });
    }
    setEffect(effectids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (effectids.length === 0) {
                return;
            }
            for (const effectid of effectids) {
                const payload = JSON.stringify({
                    id: effectid,
                });
                const deviceresponse = yield (0, request_1.default)(this.url + "/effect", {
                    body: payload,
                    headers: { "Content-Type": "application/json", "Content-Length": payload.length },
                    method: "put",
                });
                const jsonresp = yield deviceresponse.json();
            }
        });
    }
    deleteEffect(effectids) {
        return __awaiter(this, void 0, void 0, function* () {
            if (effectids.length === 0) {
                return;
            }
            const payload = JSON.stringify({
                ids: effectids,
            });
            const deviceresponse = yield (0, request_1.default)(this.url + "/effect", {
                body: payload,
                headers: { "Content-Type": "application/json", "Content-Length": payload.length },
                method: "delete",
            });
        });
    }
}
exports.ChromaInstance = ChromaInstance;
//# sourceMappingURL=ChromaInstance.js.map