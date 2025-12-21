"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
class ChromaLink extends Base_1.default {
    constructor() {
        super();
        this.device = "chromalink";
        this.supports = ["CHROMA_NONE", "CHROMA_CUSTOM", "CHROMA_STATIC"];
    }
}
exports.default = ChromaLink;
//# sourceMappingURL=ChromaLink.js.map