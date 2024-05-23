const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: process.env.NODE_ENV === "development" ? "cheap-module-eval-source-map" : "",
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "js/[name].[chunkhash:6].js",
    path: path.resolve("./dist"),
    publicPath: "./",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
        include: [path.resolve("./src")],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              esModule: false,
              name: "img/[name][hash:8].[ext]",
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|otf)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              esModule: false,
              limit: 8192,
              name: "fonts/[name].[ext]",
              publicPath: "../",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".less"],
    alias: {
      "@": path.resolve("./src"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV === "development" ? true : false,
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: true,
      favicon: path.resolve("./src/assets/img/logo-icon.svg"),
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[id].css",
    }),
    //开启gizp压缩
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0,
    }),
  ],
  optimization: {
    namedChunks: true,
    moduleIds: "hashed",
    runtimeChunk: {
      name: "manifest",
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial", // 只打包初始时依赖的第三方
        },
        antd: {
          name: "chunk-antd", // 单独将 antd 拆包
          priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
          test: /[\\/]node_modules[\\/]antd[\\/]/,
        },
      },
    },
  },
};
