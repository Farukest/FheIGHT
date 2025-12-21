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
exports.BcaAnimation = void 0;
const Animation_1 = require("../Animation");
const AnimationFrame_1 = require("../AnimationFrame");
const Color_1 = require("../Color");
class BcaAnimation extends Animation_1.Animation {
    constructor(url) {
        super();
        this.url = null;
        this.blob = null;
        if (typeof url === "string") {
            this.url = url;
        }
        else {
            this.blob = url;
        }
    }
    createFrames() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.blob !== null) {
                yield this.fromBlob(this.blob);
            }
            else {
                yield fetch(this.url).then((response) => {
                    return response.blob();
                })
                    .then(this.fromBlob);
            }
        });
    }
    fromBlob(myBlob) {
        return __awaiter(this, void 0, void 0, function* () {
            this.blob = myBlob;
            const reader = new FileReader();
            const test = new Promise((resolve, reject) => {
                reader.addEventListener("loadend", () => {
                    resolve(reader.result);
                });
            });
            reader.readAsArrayBuffer(myBlob);
            const anim = yield test;
            yield this.parseAnimation(anim);
        });
    }
    parseAnimation(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const view = new DataView(buffer);
            const fileheader = {
                BcaOffset: view.getUint32(0x0A, true),
                Size: view.getUint16(0x02, true),
                Type: view.getUint16(0x0),
            };
            const bcaheader = {
                FPS: view.getUint16(fileheader.BcaOffset + 10, true),
                FrameCount: view.getUint32(fileheader.BcaOffset + 12, true),
                FrameOffset: view.getUint32(fileheader.BcaOffset + 6, true),
                Size: view.getUint32(fileheader.BcaOffset, true),
                Version: view.getUint16(fileheader.BcaOffset + 4, true),
            };
            let lastframe = null;
            let offset = bcaheader.FrameOffset;
            for (let frame = 1; frame <= bcaheader.FrameCount; frame++) {
                const frameheader = {
                    DataSize: view.getUint16(offset + 4, true),
                    DeviceCount: view.getUint16(offset + 2, true),
                    HeaderSize: view.getUint16(offset, true),
                };
                const animframe = new AnimationFrame_1.AnimationFrame();
                animframe.delay = 10;
                if (lastframe !== null) {
                    animframe.Keyboard.grid = lastframe.Keyboard.grid.clone();
                }
                let deviceoffset = offset + 6;
                for (let device = 0; device < frameheader.DeviceCount; device++) {
                    const deviceheader = {
                        DataSize: view.getUint16(deviceoffset + 4, true),
                        DataType: view.getUint8(deviceoffset + 1),
                        Device: view.getUint16(deviceoffset + 2, true),
                        HeaderSize: view.getUint8(deviceoffset),
                    };
                    let dataoffset = deviceoffset + 6;
                    const datacount = deviceheader.DataSize / 6;
                    // console.log("COUNT", datacount);
                    for (let devicedatanum = 0; devicedatanum < datacount; devicedatanum++) {
                        const devicedata = {
                            Col: view.getUint8(dataoffset + 1),
                            RGBa: view.getUint32(dataoffset + 2, true),
                            Row: view.getUint8(dataoffset),
                        };
                        if (deviceheader.Device === 1) {
                            animframe.Keyboard.setPosition(devicedata.Row, devicedata.Col, new Color_1.Color(devicedata.RGBa));
                        }
                        else {
                            // TODO: ADD MORE DEVICES
                            // console.log("UNKNOWN");
                        }
                        dataoffset += 6;
                    }
                    deviceoffset = dataoffset;
                }
                offset = deviceoffset;
                lastframe = animframe;
                this.Frames.push(animframe);
            }
        });
    }
}
exports.BcaAnimation = BcaAnimation;
//# sourceMappingURL=BcaAnimation.js.map