<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";

interface Props {
  college: CollegeFeature;
  align?: "left" | "right";
  showRemoveButton?: true;
}

const {
  college,
  align = "left",
  showRemoveButton = true,
} = defineProps<Props>();

const emit = defineEmits<{
  remove: [uai: string];
}>();

// Alignment classes based on props
const textAlignClass = align === "right" ? "text-right" : "text-left";
const justifyContentClass = align === "right" ? "justify-end" : "justify-start";

// Remove button position based on alignment
const removeButtonPosition = align === "right" ? "order-first" : "order-last";
</script>

<template>
  <div class="min-w-0" :class="[textAlignClass]">
    <div
      class="flex items-center gap-2 min-w-0"
      :class="justifyContentClass"
    >
      <UButton
        v-if="showRemoveButton"
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        class="shrink-0" :class="[removeButtonPosition]"
        :aria-label="`Retirer ${college.properties.nom}`"
        @click="emit('remove', college.properties.uai)"
      />

      <div class="min-w-0 overflow-hidden text-left">
        <h4 class="font-semibold text-sm text-zinc-900 truncate">
          {{ college.properties.nom }}
        </h4>
        <p class="text-xs text-zinc-500 truncate">
          {{ college.properties.commune }}
        </p>
      </div>
    </div>
  </div>
</template>
