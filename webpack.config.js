const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
  {
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader'
            }
          ]
        },
        {
          test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
          use: [
            {
              loader: 'url-loader'
            }
          ]
        },
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', 'sass-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: './index.html',
        minify: false
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/favicon.ico', to: '.' }]
      })
    ]
  }
];
