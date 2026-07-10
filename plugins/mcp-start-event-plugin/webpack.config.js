const CamundaModelerWebpackPlugin = require("camunda-modeler-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { join, resolve } = require("node:path");

const outputDir = resolve(__dirname, "./dist");

module.exports = {
  mode: "development",
  entry: "./client/client.js",
  output: {
    path: outputDir,
    filename: "client.js",
  },
  devtool: "cheap-module-source-map",
  plugins: [
    new CamundaModelerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: resolve(__dirname, "./client/styles.css"),
          to: join(outputDir, "./styles.css"),
        },
      ],
    }),
  ],
};