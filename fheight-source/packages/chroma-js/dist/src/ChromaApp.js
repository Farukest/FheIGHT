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
exports.ChromaApp = void 0;
const AppInfo_1 = require("./AppInfo");
const AvailableDevices_1 = require("./Devices/AvailableDevices");
const ChromaInstance_1 = require("./ChromaInstance");
const request_1 = require("./request");
class ChromaApp {
    constructor(title, description = "", author = "TempRazerDev", contact = "razer@test.de", devices = [
        AvailableDevices_1.default.Keyboard,
        AvailableDevices_1.default.Mouse,
        AvailableDevices_1.default.Headset,
        AvailableDevices_1.default.Mousepad,
        AvailableDevices_1.default.Keypad,
        AvailableDevices_1.default.ChromaLink,
    ], category = AppInfo_1.AppCategory.Application) {
        this.uninitpromise = null;
        this.activeInstance = null;
        this.activeInstance = null;
        this.data = new AppInfo_1.AppInfo();
        this.data.Title = title;
        this.data.Description = description;
        this.data.Author.Name = author;
        this.data.Author.Contact = contact;
        this.data.DeviceSupported = devices;
        this.data.Category = category;
    }
    Instance(create = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.activeInstance !== null) {
                const instance = yield this.activeInstance;
                if (!instance.destroyed) {
                    return instance;
                }
                else {
                    this.activeInstance = null;
                }
            }
            if (create) {
                const options = {
                    body: JSON.stringify(this.data),
                    headers: { "Content-Type": "application/json" },
                    method: "post",
                };
                this.activeInstance = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const response = yield (0, request_1.default)("http://localhost:54235/razer/chromasdk", options);
                        const json = yield response.json();
                        if (json.uri !== undefined) {
                            resolve(new ChromaInstance_1.ChromaInstance(json.uri));
                        }
                        reject("Unable to retrieve URI " + JSON.stringify(json));
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
                return yield this.activeInstance;
            }
            else {
                return null;
            }
        });
    }
}
exports.ChromaApp = ChromaApp;
//# sourceMappingURL=ChromaApp.js.map