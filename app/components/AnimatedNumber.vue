<script setup lang="ts">
import { useMotionValue, useSpring } from "motion-v";

const props = withDefaults(
  defineProps<{
    value: number | null | undefined;
    decimals?: number;
    locale?: string;
  }>(),
  {
    decimals: 0,
    locale: "fr-FR",
  },
);

// Safe initial value
const safeValue = computed(() => {
  return Number.isFinite(props.value) ? props.value as number : 0;
});

// Create motion value and spring
const motionValue = useMotionValue(safeValue.value);
const springValue = useSpring(motionValue, {
  stiffness: 170,
  damping: 26,
});

// Track the animated value
const displayValue = ref(safeValue.value);

// Subscribe to spring changes
springValue.on("change", (v: number) => {
  displayValue.value = v;
});

// Format number with locale-specific separators
function formatNumber(val: number): string {
  if (!Number.isFinite(val)) {
    return "–";
  }

  return val.toLocaleString(props.locale, {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  });
}

// Formatted display value
const formattedValue = computed(() => {
  // Show dash if original value is null/undefined
  if (props.value === null || props.value === undefined || !Number.isFinite(props.value)) {
    return "–";
  }
  return formatNumber(displayValue.value);
});

// Update motion value when prop changes
watch(() => props.value, (newValue) => {
  if (Number.isFinite(newValue)) {
    motionValue.set(newValue as number);
  }
}, { immediate: true });
</script>

<template>
  <span>
    {{ formattedValue }}
  </span>
</template>
