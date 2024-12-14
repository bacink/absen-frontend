// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["vuetify-nuxt-module", "nuxt-auth-sanctum"],
  sanctum: {
    baseUrl: "http://localhost:8000", // Your Laravel API
    redirect: {
      onAuthOnly: "/login",
      onGuestOnly: "/",
    },
    globalMiddleware: {
      enabled: true,
    },
  },
});
