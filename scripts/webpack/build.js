const {merge} = require("webpack-merge");
const path = require("path");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const common = require("./common");
const {PROJECT_PATH} = require("./const");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(common, {
    mode: "production",
    devtool: false,
    output: {
        filename: "nginx-autoindex/[name].js",
        path: path.resolve(PROJECT_PATH, "./build"),
    },
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
        ],
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader, "css-loader",
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "nginx-autoindex/[name].css",
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(PROJECT_PATH, "public"),
                    to: path.resolve(PROJECT_PATH, "build"),
                    filter: (filepath) =>
                        path.resolve(filepath) !== path.resolve(PROJECT_PATH, "public/index.html"),
                },
            ],
        }),
    ],
});
