<script setup lang="ts">
import { motion } from "motion-v";

interface Props {
  isOpen: boolean;
  count: number;
}

const { isOpen, count } = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
}>();

const buttonLabel = computed(() => {
  if (count === 0)
    return "Comparer des collèges";
  if (count === 1)
    return `Comparer (${count}/2)`;
  return "Comparaison (2/2)";
});
</script>

<template>
  <motion.div
    :initial="false"
    :animate="{ y: isOpen ? 0 : 0 }"
    class="mt-3"
  >
    <button
      class="w-full bg-white border border-zinc-200/90 rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 transition-colors cursor-pointer shadow-sm"
      aria-label="Ouvrir le panneau de comparaison"
      @click="emit('toggle')"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UIcon
          name="i-lucide-git-compare"
          class="text-lg text-zinc-600 shrink-0"
        />
        <span class="text-sm font-medium text-zinc-900 truncate">
          {{ buttonLabel }}
        </span>
      </div>
    </button>
  </motion.div>
</template>
