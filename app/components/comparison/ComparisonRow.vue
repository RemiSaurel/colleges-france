<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";
import { formatFr } from "~/utils/colors";

interface Props {
  label: string;
  college1: CollegeFeature;
  college2: CollegeFeature;
  value1: number | null;
  value2: number | null;
  decimals?: number;
  suffix?: string;
  formatter?: (value: number, decimals: number) => string;
}

const {
  label,
  value1,
  value2,
  decimals = 0,
  suffix = "",
  formatter = formatFr,
} = defineProps<Props>();

// Format values for display
const formattedValue1 = computed(() => {
  if (value1 === null)
    return null;
  return `${formatter(value1, decimals)}${suffix}`;
});

const formattedValue2 = computed(() => {
  if (value2 === null)
    return null;
  return `${formatter(value2, decimals)}${suffix}`;
});
</script>

<template>
  <div class="grid grid-cols-[1fr_96px_1fr] gap-4 items-center">
    <!-- College 1 Value -->
    <div class="text-right pr-4">
      <span
        v-if="formattedValue1"
        class="text-base font-semibold"
      >
        {{ formattedValue1 }}
      </span>
      <span v-else class="text-sm text-zinc-400">—</span>
    </div>

    <!-- Label -->
    <div class="text-center">
      <span class="text-xs font-medium text-zinc-500">{{ label }}</span>
    </div>

    <!-- College 2 Value -->
    <div class="text-left pl-4">
      <span
        v-if="formattedValue2"
        class="text-base font-semibold"
      >
        {{ formattedValue2 }}
      </span>
      <span v-else class="text-sm text-zinc-400">—</span>
    </div>
  </div>
</template>
