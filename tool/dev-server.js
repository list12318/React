const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const project = require("../project.config.js");
const webpackConfig = require("./webpack.config.js");
const compiler = Webpack(webpackConfig);
const devServerOptions = project.devServer;

const server = new WebpackDevServer(compiler, devServerOptions);
const { host, port } = devServerOptions;

server.listen(port, host, () => {
    console.log(`Starting server on http://${host}:${port}`);
});
