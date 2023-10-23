// webpack config that loads the src/index.ts file, creates a js bundle, and adds it to the html in the static/html folder and uses the development server to serve the html

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ProgressPlugin } = require("webpack");
const { ModuleFederationPlugin } = require("webpack").container;

const handler = (percentage, message, ...args) => {
  console.info(percentage, message, ...args);
};

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  devServer: {
    port: 8081,
  },
  plugins: [
    // new ProgressPlugin(handler),
    new HtmlWebpackPlugin({ title: "Remote" }),
    new ModuleFederationPlugin({
      name: "Remote",
      filename: "remoteEntry.js",
      exposes: {
        "./Hello": "./src/hello.js",
      },
    }),
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "static/html"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [ts()],
  },
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

function ts() {
  return {
    test: /\.ts$/,
    exclude: /(node_modules)/,
    use: {
      loader: "swc-loader",
      options: {
        jsc: {
          parser: {
            syntax: "typescript",
          },
        },
      },
    },
  };
}
