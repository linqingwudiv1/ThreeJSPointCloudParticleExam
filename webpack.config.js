const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode:'development',
    //mode:'production',
    devtool: 'eval-source-map',
    entry:  __dirname + "/src/js/main.js",
    output: {
      path: __dirname + "/public",
      filename: "bundle.js"
    },
    devServer: {
        contentBase: "./public",//本地服务器所加载的页面所在的目录
        historyApiFallback: true,//不跳转
        inline: true//实时刷新
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