import colors from "vuetify/es5/util/colors";
import fs from "fs";
import path from "path";

export default {
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "peerjs.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "peerjs.crt")),
    },
    host: process.env.HOST,
  },
  env: {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    SIGNALSERVERHOST: process.env.SIGNALSERVERHOST,
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: "%s - p2p-messenger",
    title: "p2p-messenger",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },
  rules: [
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    },
  ],

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    // https://go.nuxtjs.dev/vuetify
    "@nuxtjs/vuetify",
    "@nuxtjs/composition-api/module",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  serverMiddleware: [
    // Will register file from project server-middleware directory to handle /server-middleware/* requires
    { path: "/api/index.js", handler: "~/api/index.js", changeOrigin: true },
  ],
};
