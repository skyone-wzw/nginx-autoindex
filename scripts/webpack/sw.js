const path = require("path");

const {PROJECT_PATH} = require("./const");

module.exports = {
    mode: "production",
    entry: path.resolve(PROJECT_PATH, "sw.js"),
    output: {
        filename: "nginx-autoindex/sw.js",
        path: path.resolve(PROJECT_PATH, "build"),
    },
    target: "webworker",
    resolve: {
        extensions: [".js"],
    },
    optimization: {
        minimize: true,
    },
};
