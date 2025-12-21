"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorInfo = void 0;
class AuthorInfo {
    toJSON() {
        return {
            contact: this.Contact,
            name: this.Name,
        };
    }
}
exports.AuthorInfo = AuthorInfo;
//# sourceMappingURL=AuthorInfo.js.map