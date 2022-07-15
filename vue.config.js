const path = require("path");
const { defineConfig } = require("@vue/cli-service");
const { InjectManifest } = require("workbox-webpack-plugin");

const configs = {
  transpileDependencies: ["quasar"],

  pluginOptions: {
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },
  configureWebpack: {
    resolve: {
      modules: [path.resolve("./src"), path.resolve("./node_modules")],
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      },
    },
    plugins: [],
  },
};

if (process.env.NODE_ENV === "production") {
  configs.configureWebpack.plugins.push(
    new InjectManifest({
      swSrc: path.join(process.cwd(), "/service-worker.js"),
      maximumFileSizeToCacheInBytes: 15000000,
    })
  );
}

module.exports = defineConfig(configs);
