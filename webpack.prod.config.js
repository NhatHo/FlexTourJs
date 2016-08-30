/*******************************************************************************
 * Copyright (c) 2016. MIT License.
 * NhatHo-nhatminhhoca@gmail.com
 ******************************************************************************/

module.exports = {
    entry: "./main/FlexTour.js",

    output: {
        path: __dirname + '/dist',
        filename: 'flextour.min.js',
        libraryTarget: "umd",
        library: "FlexTour",
        umdNamedDefine: true
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