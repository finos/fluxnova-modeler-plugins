const path = require("path");

module.exports = {
  mode: "development",
  entry: "./client/client.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "client.js",
  },
  plugins: [
    new CamundaModelerWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: "client/styles.css",
          to: "styles.css",
        },
      ],
    }),
  ],
  devtool: "cheap-module-source-map",
};
