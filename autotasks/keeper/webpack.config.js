const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader', 'ts-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      common: path.resolve(__dirname, '../common/'),
      shared: path.resolve(__dirname, '../../shared/'),
    },
    extensions: ['.ts', '.js'],
  },
  externals: [
    // List here all dependencies available on the Autotask environment
    /lodash/,
    /axios/,
    /apollo-client/,
    /ethers/,
    /@ethersproject\/.*/,
    /aws-sdk/,
    /aws-sdk\/.*/,
  ],
  externalsType: 'commonjs2',
  plugins: [
    // List here all dependencies that are not run in the Autotask environment
    new webpack.IgnorePlugin({ resourceRegExp: /dotenv/ }),
  ],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: { type: 'commonjs2' },
  },
};
