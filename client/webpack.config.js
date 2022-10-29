const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const port = process.env.PORT || 3000;
module.exports = {
    mode: 'development',  
    entry: './src/index.js',
    output: {
      filename: 'bundle.[hash].js'
    },
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
            test: /\.svg$/,
            use: [
              {
                loader: 'svg-url-loader',
                options: {
                  limit: 10000,
                },
              },
            ],
          },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
            test: /\.(glsl|vs|fs)$/,
            loader: 'shader-loader',
            // options: {
            //   glsl: {
            //     chunkPath: resolve("/glsl/chunks")
            //   }
            // }
          }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        favicon: 'public/favicon.ico',
        manifest: "./public/manifest.json"
      })
    ],
    devServer: {
      host: 'localhost',
      port: port,
      historyApiFallback: true,
      open: true
    }
};