const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: [
        path.join(__dirname, 'src/popup.ts')
    ],
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            exclude: /node_modules/,
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    },
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js']
    }
    // plugins: [
    //    new webpack.optimize.UglifyJsPlugin()
    // ]
};
