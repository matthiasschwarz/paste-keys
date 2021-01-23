module.exports = {
  pages: {
    popup: {
      template: "public/browser-extension.html",
      entry: "./src/popup/main.ts",
      title: "Popup",
    },
    options: {
      template: "public/browser-extension.html",
      entry: "./src/options/main.ts",
      title: "Options",
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        contentScripts: {
          entries: {
            pasteKeys: ["src/content-scripts/content-script.ts"],
          },
        },
      },
    },
  },
  transpileDependencies: ["vuetify"],
};
