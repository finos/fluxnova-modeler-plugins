const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const CamundaModelerWebpackPlugin = require('camunda-modeler-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  const copyPatterns = [
    {
      from: path.resolve(__dirname, './backend/config'),
      to: path.resolve(__dirname, './dist/backend/config'),
      info: { minimized: true }
    },
    {
      from: 'client/style.css',
      to: 'style.css'
    },
  ];

  if (isProduction) {
    copyPatterns.push({
      from: path.resolve(__dirname, './node_modules/npm-groovy-lint/'),
      to: path.resolve(__dirname, './dist/node_modules/npm-groovy-lint/')
    });
  }

  return [
    {
      mode: isProduction ? 'production' : 'development',
      entry: './backend/main.js',
      target: 'node',
      externals: {
        'npm-groovy-lint': 'commonjs npm-groovy-lint'
      },
      output: {
        path: path.resolve(__dirname, 'dist/backend'),
        filename: 'main.js',
        libraryTarget: 'commonjs2'
      },
      optimization: {
        minimize: isProduction,
        nodeEnv: isProduction ? 'production' : 'development'
      },
      module: {
        rules: [
          {
            test: /node_modules\/eslint/,
            resolve: {
              mainFields: [ 'browser', 'main', 'module' ]
            },
          }
        ]
      },
      devtool: isProduction ? false : 'cheap-module-source-map'
    },
    {
      mode: isProduction ? 'production' : 'development',
      entry: './client/index.js',
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'client.js'
      },
      optimization: {
        minimize: isProduction,
        usedExports: true,
        sideEffects: true
      },
      plugins: [
        new CamundaModelerWebpackPlugin(),
        new MonacoWebpackPlugin({ languages: [ 'javascript', 'typescript' ] }),
        new CopyPlugin({ patterns: copyPatterns })
      ],
      module: {
        rules: [
          {
            test: /\.svg$/,
            use: 'react-svg-loader'
          },
          {
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
          },
          {
            test: /\.d\.ts$/,
            use: 'raw-loader'
          },
        ]
      },
      resolve: {
        fallback: { 'path': require.resolve('path-browserify') },
        extensions: [ '.jsx', '.js', '.tsx', '.ts' ],
      },
      devtool: isProduction ? false : 'cheap-module-source-map'
    }
  ];
};