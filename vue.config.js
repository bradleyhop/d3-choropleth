module.exports = {
  pluginOptions: {
    lintStyleOnBuild: false,
  },
  css: {
    loaderOptions: {
      scss: {
        data: `
        @import "@/assets/color-variables.scss";
        `,
      },
    },
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/d3-choropleth-build/' : '/',
};
