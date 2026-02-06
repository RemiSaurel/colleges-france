<script setup lang="ts">
useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico" },
  ],
  htmlAttrs: {
    lang: "fr",
  },
});

const title = "Carte des collèges en France - IPS et résultats au DNB";
const description = "Explorez les collèges en France : indice de position sociale (IPS) et résultats au DNB de chaque collège, sur une carte interactive.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
