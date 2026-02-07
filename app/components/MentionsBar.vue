<script setup lang="ts">
interface MentionsPct {
  tb: number; // Très Bien (emerald)
  b: number; // Bien (blue)
  ab: number; // Assez Bien (amber)
  sans: number; // Sans mention (grey)
}

interface Props {
  mentions: MentionsPct | null | undefined;
  showLegend?: boolean;
  align?: "left" | "right";
  barHeight?: string;
}

const {
  mentions,
  showLegend = true,
  align = "left",
  barHeight = "h-2",
} = defineProps<Props>();

// Mention colors (matching existing design)
const MENTION_COLORS = {
  sans: "bg-zinc-300",
  ab: "bg-amber-400",
  b: "bg-blue-500",
  tb: "bg-emerald-500",
} as const;

const MENTION_LABELS = {
  sans: "Sans",
  ab: "AB",
  b: "B",
  tb: "TB",
} as const;

// Order for display (left to right)
const mentionOrder = ["sans", "ab", "b", "tb"] as const;

// Justify based on alignment
const flexJustify = align === "right" ? "justify-end" : "justify-start";
</script>

<template>
  <div v-if="mentions">
    <!-- Bar -->
    <div
      class="flex rounded-full overflow-hidden"
      :class="[barHeight, flexJustify]"
    >
      <div
        v-for="type in mentionOrder"
        :key="type"
        :class="MENTION_COLORS[type]"
        :style="{ width: `${mentions[type]}%` }"
        :title="`${MENTION_LABELS[type]}: ${mentions[type].toFixed(1)}%`"
      />
    </div>

    <!-- Legend -->
    <div
      v-if="showLegend"
      class="flex gap-3 mt-2 text-[10px] text-zinc-500"
    >
      <span
        v-for="type in mentionOrder"
        :key="type"
        class="flex items-center gap-1"
      >
        <span
          class="inline-block w-2 h-2 rounded-full"
          :class="MENTION_COLORS[type]"
        />
        {{ MENTION_LABELS[type] }}
      </span>
    </div>
  </div>

  <!-- No data fallback -->
  <span
    v-else
    class="text-xs text-zinc-400"
  >
    Pas de données
  </span>
</template>
