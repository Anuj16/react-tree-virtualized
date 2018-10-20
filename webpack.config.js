var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
 
module.exports = {
    mode: 'production',
    entry: './src/tree.js',
    output: {
        path: path.resolve('lib'),
        filename: 'tree.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules : [
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options:{
                            fallback: "file-loader",
                            name: "[name][md5:hash].[ext]",
                            outputPath: 'assets/',
                            publicPath: '/assets/'
                        }
                    }    
                ]
            },
            {
                test: /\.(js|jsx)$/,
                use: ["babel-loader"],
                exclude: /node_modules/,
            }
        ]
    }
}