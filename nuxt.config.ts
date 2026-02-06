// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxt/fonts",
    "@vueuse/nuxt",
    "motion-v/nuxt",
    "@nuxt/image",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "light",
    fallback: "light",
  },

  routeRules: {
    "/api/colleges": { swr: 86400 },
  },

  compatibilityDate: "2025-01-15",

  nitro: {
    routeRules: {
      "/api/colleges": { cache: { maxAge: 86400 } },
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  fonts: {
    families: [
      { name: "Instrument Sans", provider: "google" },
    ],
  },
});
