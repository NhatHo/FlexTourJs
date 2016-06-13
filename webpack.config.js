module.exports = {
    entry: "./main/scripts/FlexTour.js",
    output: {
        path: __dirname,
        filename: "framework.js",
        libraryTarget: "var",
        library: "FlexTour"
    },
    module: {
        loaders: [
            {test: /\.less$/, loader: "style!less"}
        ]
    }
};