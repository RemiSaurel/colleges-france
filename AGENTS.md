# Agent Development Guide

This document provides coding conventions and guidelines for AI agents working in this repository.

## Project Overview

Educational data visualization app built with **Nuxt 4** (Vue 3.5, TypeScript strict mode), **Nuxt UI v4**, **MapLibre GL**, and **Tailwind CSS v4**. Displays ~7,000 French middle schools (collèges) on an interactive map, colored by IPS (Social Position Index) with DNB exam results.

**Tech Stack:** Nuxt 4.3.0, Vue 3.5.27, TypeScript 5.9.3, Nuxt UI 4.4.0, MapLibre GL 5.17.0, pnpm 10.28.2

## Commands

```bash
# Development
pnpm dev                    # Start dev server at http://localhost:3000
pnpm build                  # Production build
pnpm preview                # Preview production build
pnpm typecheck              # Run TypeScript type checking
pnpm lint                   # Run ESLint on all files
pnpm postinstall            # Generate .nuxt types (runs automatically)

# No test suite currently configured
```

## Project Structure

```
educ/
├── app/
│   ├── components/         # Vue components (PascalCase.vue)
│   ├── composables/        # Composition functions (useX.ts)
│   ├── pages/             # Route pages (lowercase.vue)
│   ├── utils/             # Utilities and types
│   ├── assets/css/        # Global styles
│   ├── app.vue            # Root component
│   └── app.config.ts      # App configuration
├── server/
│   ├── api/               # API endpoints (name.get.ts)
│   └── utils/             # Server utilities
├── public/                # Static assets
├── nuxt.config.ts         # Nuxt configuration
├── tsconfig.json          # TypeScript config (references)
└── eslint.config.mjs      # ESLint flat config
```

## Code Style

### TypeScript

- **Strict mode enabled** - No `any`, handle null/undefined explicitly
- **Type imports:** Always use `import type { Type } from '...'`
- **Return types:** Explicitly type all function returns
- **Null safety:** Use optional chaining `?.` and nullish coalescing `??`
- **Generics:** Use for reusable functions (`<T>`, `Promise<T[]>`)

```typescript
// Good
import type { CollegeFeature } from '~/utils/types'
export function formatFr(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '–'
  return value.toLocaleString('fr-FR', { minimumFractionDigits: decimals })
}

// Bad
import { CollegeFeature } from '~/utils/types'  // Missing 'type'
export function formatFr(value: any) { ... }    // No type safety
```

### Vue Components

**Always use `<script setup lang="ts">` with Composition API:**

```vue
<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";
import { formatFr } from "~/utils/colors";

// Props: Always use TypeScript generics
const props = defineProps<{
  college: CollegeFeature;
  onClose: () => void;
}>();

// Emits: Type all events
const emit = defineEmits<{
  "update:filters": [filters: FilterState];
}>();

// State: Type refs explicitly when needed
const sidebarOpen = ref(true);
const mapContainer = ref<HTMLDivElement>();
const map = shallowRef<maplibregl.Map>(); // Use shallowRef for complex objects

// Computed: Two-way for v-model
const search = computed({
  get: () => props.filters.search,
  set: value => emit("update:filters", { ...props.filters, search: value })
});

// Lifecycle
onMounted(() => {
  // Setup code
  onUnmounted(() => {
    // Cleanup
  });
});

// Watch with options
watch(() => props.data, handler, { deep: true });
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      :disabled="!isValid"
      @click="handleClick"
    />
  </div>
</template>

<style scoped>
/* Component-specific animations/overrides only */
.fade-enter-active { transition: opacity 0.2s ease; }
</style>
```

### Imports

**Order:** External → Types → Utils → Components
```typescript
import type { CollegeFeature } from "~/utils/types";
import maplibregl from "maplibre-gl";
import { formatFr, ipsColor } from "~/utils/colors";
import "maplibre-gl/dist/maplibre-gl.css";
```

**Path aliases:**
- `~/` - app directory
- `@/` - app directory (alternative)
- `#app` - Nuxt runtime
- `#server` - Server utilities

### Naming Conventions

| Type | Convention | Examples |
|------|-----------|----------|
| **Files** | | |
| Vue Components | PascalCase | `CollegeMap.vue`, `FilterSidebar.vue` |
| Composables | camelCase + `use` | `useColleges.ts`, `useFilterSync.ts` |
| Utils | camelCase | `colors.ts`, `education-api.ts` |
| Pages | lowercase | `index.vue`, `about.vue` |
| API Routes | lowercase + `.get` | `colleges.get.ts` |
| **Functions** | | |
| Composables | `use` prefix | `useColleges()`, `useFetch()` |
| Utilities | camelCase verbs | `formatFr()`, `ipsColor()` |
| Actions | camelCase verbs | `selectCollege()`, `resetFilters()` |
| **Variables** | | |
| Constants | UPPER_SNAKE_CASE | `IPS_MIN`, `CACHE_TTL`, `BASE_URL` |
| State | camelCase | `filters`, `selectedCollege` |
| Computed | camelCase | `filteredFeatures`, `hasActiveFilters` |
| **Types** | | |
| Interfaces/Types | PascalCase | `FilterState`, `CollegeFeature` |

### Composables Pattern

```typescript
// app/composables/useExample.ts
export function useExample() {
  // Fetch data
  const { data, status, error } = useFetch<Type>("/api/endpoint", {
    lazy: true
  });

  // Reactive state
  const state = reactive<StateType>({
    prop: "value"
  });
  const selected = ref<Type | null>(null);

  // Computed
  const derived = computed(() => {
    if (!data.value)
      return [];
    return data.value.filter(/* ... */);
  });

  // Actions
  function action(param: Type): void {
    state.prop = param;
  }

  // Watchers
  watch(() => state.prop, handler);

  // Return public API
  return {
    data,
    status,
    error,
    state,
    derived,
    action
  };
}
```

### Error Handling

**Pattern 1:** Status-based UI rendering
```vue
<div v-if="status === 'pending'">
  <LoadingState :status="status" />
</div>

<div v-else-if="error">
  <UIcon name="i-lucide-alert-triangle" class="text-red-500" />
  <p>Erreur de chargement</p>
</div>
```

**Pattern 2:** Early return with null checks
```typescript
const computed = computed(() => {
  if (!data.value?.features)
    return [];
  return data.value.features.filter(/* ... */);
});
```

**Pattern 3:** Null coalescing for safe defaults
```typescript
properties: {
  taux_reussite: ivac?.taux_de_reussite_g ?? null,
  mentions_tb: ivac?.nb_mentions_tb_g ?? null
}
```

**Pattern 4:** Optional chaining for safe access
```typescript
const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
if (source) {
  source.setData(buildGeoJSON(features));
}
```

**Logging:** Use descriptive logs with context prefix
```typescript
console.log("[colleges] Fetching data from API...");
console.log(`[colleges] Built GeoJSON with ${features.length} features`);
```

### Server-Side Patterns

**API Routes:** Use `defineEventHandler`
```typescript
// server/api/example.get.ts
export default defineEventHandler(async () => {
  // Fetch data
  const data = await $fetch<Type>(url);

  // Process
  const result = data.map(/* ... */);

  return result;
});
```

**Caching Pattern:**
```typescript
let cachedData: Type | null = null;
let cachedAt = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000;

export default defineEventHandler(async () => {
  const now = Date.now();
  if (cachedData && (now - cachedAt) < CACHE_TTL) {
    return cachedData;
  }

  const data = await fetchData();
  cachedData = data;
  cachedAt = now;
  return data;
});
```

## ESLint Configuration

- **Flat config** from `.nuxt/eslint.config.mjs`
- **Stylistic rules:**
  - No trailing commas (`commaDangle: 'never'`)
  - One True Brace Style (`braceStyle: '1tbs'`)
- **EditorConfig:** 2-space indent, LF line endings, UTF-8, trim whitespace

## Design System

- **UI Library:** Nuxt UI v4 (Tailwind CSS v4 based)
- **Colors:** Neutral zinc palette, light mode only
- **Icons:** `i-lucide-*` from Lucide icon set
- **Typography:** System font stack
- **Style:** Minimalist, Linear.app-inspired

**Component Usage:**
```vue
<UButton color="neutral" variant="solid" size="md" icon="i-lucide-x" />

<UInput v-model="search" placeholder="..." />

<UAccordion :items="accordionItems" />

<USlideover v-model:open="open" side="left" />

<UTooltip text="Tooltip text">
<button />
</UTooltip>
```

## Important Notes

1. **Always run lint before committing:** `pnpm lint`
2. **No `any` types allowed** - strict TypeScript mode
3. **Client-only code:** Wrap MapLibre and browser APIs in `<ClientOnly>`
4. **Props pattern:** Use `const props = defineProps<{}>()` then access via `props.`
5. **MapLibre objects:** Use `shallowRef` not `ref` for map instances
6. **French UI text:** User-facing content in French, code comments in English
7. **Type safety:** Handle null/undefined explicitly everywhere
8. **CI checks:** Lint and typecheck must pass on every push

## Common Patterns Reference

**Fetch with loading state:**
```typescript
const { data, status, error } = useFetch<Type>("/api/endpoint", { lazy: true });
```

**Filter array safely:**
```typescript
const filtered = computed(() => {
  if (!data.value?.items)
    return [];
  return data.value.items.filter(item => item.value > threshold);
});
```

**Two-way computed for v-model:**
```typescript
const value = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});
```

**MapLibre layer management:**
```typescript
if (map.value?.getLayer(LAYER_ID)) {
  map.value.removeLayer(LAYER_ID);
}
map.value?.addLayer({ id: LAYER_ID, /* ... */ });
```

**Cleanup in onMounted:**
```typescript
onMounted(() => {
  const handler = () => { /* ... */ };
  window.addEventListener("event", handler);
  onUnmounted(() => window.removeEventListener("event", handler));
});
```
