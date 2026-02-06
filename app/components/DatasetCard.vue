<script setup lang="ts">
const props = defineProps<{
  name: string;
  id: string;
  description: string;
  year: string;
}>();

// Shorten the dataset ID for display
const shortId = computed(() => {
  // Remove 'fr-en-' prefix and shorten long names
  return props.id
    .replace("fr-en-", "")
    .replace("indicateurs-valeur-ajoutee-colleges", "ivac")
    .replace("ips-colleges-ap2023", "ips-2023")
    .replace("annuaire-education", "annuaire");
});
</script>

<template>
  <div
    class="border border-zinc-200/80 rounded-lg p-4 bg-white flex justify-between flex-col h-full"
  >
    <div class="flex flex-col flex-1  gap-2">
      <p class="text-sm font-semibold text-highlighted leading-tight">
        {{ name }}
      </p>
      <UBadge
        variant="subtle"
        size="sm"
        class="self-start"
        color="neutral"
        icon="i-lucide-calendar"
      >
        {{ year }}
      </UBadge>
      <p class="text-xs text-muted leading-relaxed">
        {{ description }}
      </p>
    </div>
    <UButton
      :to="`https://data.education.gouv.fr/explore/dataset/${id}/`"
      target="_blank"
      icon="i-lucide-external-link"
      variant="link"
      size="xs"
      :label="shortId"
      class="text-xs self-start mt-2 -ml-2"
    />
  </div>
</template>
