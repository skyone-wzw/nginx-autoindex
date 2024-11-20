const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackBar = require("webpackbar");
const {PROJECT_PATH} = require("./const");

module.exports = {
    stats: "errors-warnings",
    entry: {
        app: path.resolve(PROJECT_PATH, "./src/index.tsx"),
        bootloader: path.resolve(PROJECT_PATH, "./src/bootloader.ts")
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
        alias: {},
    },
    module: {
        rules: [
            {
                test: /\.(jsx?|tsx?)$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                    },
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: path.resolve(PROJECT_PATH, "tsconfig.json"),
                        },
                    },
                ],
            },
            {
                test: /\.(woff2?|ttf)/,
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new WebpackBar({
            name: "Build project",
            color: "#52c41a",
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(PROJECT_PATH, "./public/index.ejs"),
            inject: false,
            minify: false,
            filename: "autoindex.html",
            publicPath: "/",
        }),
    ],
};
