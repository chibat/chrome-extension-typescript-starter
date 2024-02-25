const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const fs = require("fs");

/**
 * @param {string} folder 
 */
function GetFilePaths(folder) {
    const files = fs.readdirSync(folder);
    let filesRouteObject = {};

    for (const file of files) {
        if (file.startsWith("__")) continue;

        const fileRoute = `${folder}/${file}`;
        if (fs.lstatSync(fileRoute).isDirectory()) {
            filesRouteObject = {
                ...filesRouteObject,
                ...GetFilePaths(fileRoute)
            };
        } else {
            //Removing `./src`
            let fileBuildName = fileRoute.substring(6);

            //Removing extension
            fileBuildName = fileBuildName.split(".");
            fileBuildName.pop();
            fileBuildName = fileBuildName.join(".");

            filesRouteObject[fileBuildName] = fileRoute;
        }
    }

    return filesRouteObject;
}


module.exports = {
    entry: {
        ...GetFilePaths("./src")
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            name: "vendor",
            chunks(chunk) {
                return chunk.name !== 'background';
            }
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: ".", to: "../", context: "public" }],
            options: {},
        }),
    ],
};
