"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestData = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
function getTestData() {
    const fn = path_1.join(__dirname, "../../data.json");
    const fc = fs_1.readFileSync(fn, {
        encoding: "utf-8"
    });
    return JSON.parse(fc);
}
exports.getTestData = getTestData;
//# sourceMappingURL=File.js.map