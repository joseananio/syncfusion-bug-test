import * as webpack from 'webpack';

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      VERSION: (+new Date()).toString(),
    }),
  ],
} as webpack.Configuration;
