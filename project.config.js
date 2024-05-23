module.exports = {
  devServer: {
    historyApiFallback: true,
    logLevel: "info",
    stats: {
      colors: true,
    },
    contentBase: "./example",
    port: 3000,
    host: "0.0.0.0",
    open: false,
    hot: true,
    inline: false,
    proxy: {
      "/MapTiles": {
        target: "https://192.168.6.71/",
        secure: false,
      },
      "/police-box": {
        target: "https://192.168.6.73",
        secure: false,
      },
      "/device-screen": {
        target: "https://192.168.6.73",
        secure: false,
      },
    },
  },
};
