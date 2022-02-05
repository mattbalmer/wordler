const path = require('path');

const watch = process.env.WATCH !== 'false';

console.log(`Starting webpack: `, {
  watch,
});

module.exports = {
  mode: 'development',

  entry: {
    content: './source/content.ts',
    background: './source/background.ts',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  watch,

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@crx': path.resolve(__dirname, 'source'),
      '@solver': path.resolve(__dirname, '../source'),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          allowTsInNodeModules: true,
        }
      },

      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
};