<script setup lang="ts">
const { status } = defineProps<{
  status: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full gap-6 text-zinc-600 px-6">
    <div class="relative">
      <div class="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-blue-500 animate-spin" />
    </div>
    <div class="text-center max-w-md">
      <p class="font-semibold text-base mb-2">
        Chargement des données
      </p>
      <p class="text-sm text-zinc-500 leading-relaxed">
        {{ status === 'pending' ? 'Récupération et agrégation de ~7 000 collèges depuis data.education.gouv.fr' : 'Connexion en cours…' }}
      </p>
      <div class="mt-4 flex items-center justify-center gap-1 text-xs text-zinc-400">
        <UIcon
          name="i-lucide-database"
          class="text-sm"
        />
        <span>Sources: <a
          href="https://data.education.gouv.fr/pages/accueil/"
          target="_blank"
          rel="noopener noreferrer"
        >data.education.gouv.fr</a></span>
      </div>
    </div>
  </div>
</template>
