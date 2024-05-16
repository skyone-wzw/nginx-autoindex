const {merge} = require("webpack-merge");
const path = require("path");

const common = require("./common");
const {PROJECT_PATH, SERVER_HOST, SERVER_PORT} = require("./const");

module.exports = merge(common, {
    mode: "development",
    devtool: "cheap-module-source-map",
    output: {
        filename: "nginx-autoindex/[name].js",
        path: path.resolve(PROJECT_PATH, "./build"),
        assetModuleFilename: "nginx-autoindex/fonts/[name][ext]",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    "style-loader", "css-loader",
                ],
            },
        ],
    },
    devServer: {
        host: SERVER_HOST,
        port: SERVER_PORT,
        compress: true,
        open: true,
        hot: true,
        historyApiFallback: {
            disableDotRule: true,
            index: "/",
        },
        proxy: [{
            context: ["**", "!/nginx-autoindex/**", "!/autoindex.html"],
            target: "http://192.168.172.162", // 调试同 nginx 的链接
        }],
    },
});
