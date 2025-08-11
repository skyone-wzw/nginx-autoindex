module.exports = function (api) {
    api.cache(true);
    return {
        plugins: [],
        presets: [
            [
                "@babel/preset-env",
                {
                    corejs: 3,
                    useBuiltIns: "usage",
                },
            ],
            [
                "@babel/preset-react",
                {
                    runtime: "automatic",
                },
            ],
        ],
    };
};
