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

// Safe initial value - normalize -0 to 0
const safeValue = computed(() => {
  if (!Number.isFinite(props.value))
    return 0;
  const val = props.value as number;
  return val === 0 ? 0 : val;
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
  if (!Number.isFinite(val))
    return "–";
  // Normalize -0 to 0
  const normalizedVal = val === 0 ? 0 : val;
  return normalizedVal.toLocaleString(props.locale, {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  });
}

// Formatted display value
const formattedValue = computed(() => {
  // Show dash if original value is null/undefined
  if (props.value === null || props.value === undefined || !Number.isFinite(props.value))
    return "–";
  // Normalize -0 to 0 before formatting
  const val = displayValue.value === 0 ? 0 : displayValue.value;
  return formatNumber(val);
});

// Update motion value when prop changes
watch(() => props.value, (newValue) => {
  if (Number.isFinite(newValue)) {
    // Normalize -0 to 0
    const normalizedValue = newValue === 0 ? 0 : newValue as number;
    motionValue.set(normalizedValue);
  }
}, { immediate: true });
</script>

<template>
  <span>
    {{ formattedValue }}
  </span>
</template>
