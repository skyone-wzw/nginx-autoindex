module.exports = function (api) {
    api.cache(true);
    return {
        plugins: [],
        presets: [
            "@babel/preset-env",
            [
                "@babel/preset-react",
                {
                    runtime: "automatic"
                }
            ]
        ],
    };
};
