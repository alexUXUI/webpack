const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ProgressPlugin } = require("webpack");
const DependencyCountPlugin = require("./plugin/instability.plugin");

const userModules = ["src/"]; // Specify the user modules here

const plugin = new DependencyCountPlugin({
  exclude: /node_modules/,
});

const handler = (percentage, message, ...args) => {
  console.info(percentage, message, ...args);
};

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  devServer: {
    port: 3000,
  },
  plugins: [
    // new ProgressPlugin(handler),
    plugin,
    new HtmlWebpackPlugin({ title: "Instability" }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "static/html"),
  },
  resolve: {
    extensions: [".js"],
  },
  module: {},
  optimization: {
    runtimeChunk: "single", // extract webpack runtime code into it's own file
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};
