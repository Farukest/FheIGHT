"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppInfo = exports.AppCategory = void 0;
const AuthorInfo_1 = require("./AuthorInfo");
var AppCategory;
(function (AppCategory) {
    AppCategory[AppCategory["Application"] = "application"] = "Application";
    AppCategory[AppCategory["Game"] = "game"] = "Game";
})(AppCategory = exports.AppCategory || (exports.AppCategory = {}));
class AppInfo {
    constructor() {
        this.Author = new AuthorInfo_1.AuthorInfo();
        this.DeviceSupported = [];
    }
    toJSON() {
        return {
            author: this.Author,
            category: this.Category,
            description: this.Description,
            device_supported: this.DeviceSupported,
            title: this.Title,
        };
    }
}
exports.AppInfo = AppInfo;
//# sourceMappingURL=AppInfo.js.map