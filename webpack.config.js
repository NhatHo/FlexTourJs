/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

module.exports = {
    entry: "./main/FlexTour.js",
    output: {
        path: __dirname,
        filename: "./dist/flextour.js",
        libraryTarget: "var",
        library: "FlexTour"
    },
    module: {
        loaders: [
            {test: /\.less$/, loader: "style!less"}
        ]
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery"
    }
};