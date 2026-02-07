<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";
import { motion } from "motion-v";
import { ipsColor } from "~/utils/colors";

const { features, selectedIps } = defineProps<{
  features: CollegeFeature[];
  selectedIps: number | null;
}>();

const BINS = 24;
const MIN = 50;
const MAX = 170;

const histogram = computed(() => {
  const binWidth = (MAX - MIN) / BINS;
  const bins = Array.from({ length: BINS }, (_, i) => ({
    min: MIN + i * binWidth,
    max: MIN + (i + 1) * binWidth,
    count: 0,
  }));

  for (const f of features) {
    const ips = f.properties.ips;
    if (ips === null || ips === undefined)
      continue;
    const idx = Math.min(BINS - 1, Math.max(0, Math.floor((ips - MIN) / binWidth)));
    bins[idx]!.count++;
  }

  const maxCount = Math.max(...bins.map(b => b.count), 1);

  return bins.map(b => ({
    ...b,
    height: (b.count / maxCount) * 100,
    midIps: (b.min + b.max) / 2,
    color: ipsColor((b.min + b.max) / 2),
  }));
});
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
      <div class="text-xs font-medium text-zinc-500">
        Distribution IPS
      </div>
      <div class="text-xs text-zinc-400">
        {{ features.length.toLocaleString('fr-FR') }} collège{{ features.length > 1 ? 's' : '' }}
      </div>
    </div>
    <div class="flex items-end gap-px h-20 pt-1">
      <motion.div
        v-for="(bin, i) in histogram"
        :key="i"
        class="flex-1 rounded-t-sm relative group"
        :initial="{ scaleY: 0, height: '2%' }"
        :animate="{
          scaleY: 1,
          height: `${Math.max(2, bin.height)}%`,
          backgroundColor: bin.color,
          opacity: selectedIps !== null && (selectedIps < bin.min || selectedIps >= bin.max) ? 0.25 : 0.85,
        }"
        :transition="{
          scaleY: {
            type: 'spring',
            stiffness: 400,
            damping: 20,
            delay: i * 0.03,
          },
          height: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
          },
          backgroundColor: {
            duration: 0.3,
          },
          opacity: {
            duration: 0.2,
          },
        }"
        :style="{
          originY: 1,
        }"
        :while-hover="{ scale: 1.10, zIndex: 10 }"
        :while-press="{ scale: 0.95 }"
      >
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
          <div class="bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
            {{ Math.round(bin.min) }}–{{ Math.round(bin.max) }}: {{ bin.count }}
          </div>
        </div>
      </motion.div>
    </div>
    <div class="flex justify-between text-[10px] text-zinc-400 mt-0.5">
      <span>{{ MIN }}</span>
      <span>{{ (MIN + MAX) / 2 }}</span>
      <span>{{ MAX }}</span>
    </div>
  </div>
</template>
