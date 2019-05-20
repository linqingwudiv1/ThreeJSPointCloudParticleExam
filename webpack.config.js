const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode:'development',
    //mode:'production',//发布版本
    devtool: 'eval-source-map',
    entry:  __dirname + "/src/js/main.js",
    output: {
      path: __dirname + "/public",
      filename: "bundle.js"
    },
    devServer: {
        contentBase: "./public",
        historyApiFallback: true,
        inline: true
    },
    plugins:[
        new CopyPlugin([
            {
                from: __dirname + '/static',
                to: __dirname +   '/public/static'
            }
          ]),
    ] 
}