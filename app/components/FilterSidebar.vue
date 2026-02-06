<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import type { FilterState } from "~/utils/types";
import { useDebounceFn } from "@vueuse/core";
import {
  DROM_COM_REGIONS,
  formatRegionName,
  IPS_MAX,
  IPS_MIN,
  METROPOLITAN_REGIONS,
  NB_CANDIDATS_MAX,
  NB_CANDIDATS_MIN,
  NOTE_ECRIT_MAX,
  NOTE_ECRIT_MIN,
  TAUX_REUSSITE_MAX,
  TAUX_REUSSITE_MIN,
  VALEUR_AJOUTEE_MAX,
  VALEUR_AJOUTEE_MIN,
} from "~/utils/types";

const props = defineProps<{
  filters: FilterState;
  hasDnbFilters: boolean;
  onReset: () => void;
}>();

const emit = defineEmits<{
  "update:filters": [filters: FilterState];
}>();

// Create local writable computed refs that emit updates
const search = computed({
  get: () => props.filters.search,
  set: value => emit("update:filters", { ...props.filters, search: value }),
});

const regions = computed({
  get: () => props.filters.regions,
  set: value => emit("update:filters", { ...props.filters, regions: value }),
});

const locationMode = computed({
  get: () => props.filters.locationMode,
  set: value => emit("update:filters", { ...props.filters, locationMode: value }),
});

const secteur = computed({
  get: () => props.filters.secteur || "__all__",
  set: value => emit("update:filters", { ...props.filters, secteur: value === "__all__" ? "" : value }),
});

// Local state for IPS range to handle immediate UI updates
const localIpsRange = ref<[number, number]>(props.filters.ipsRange);

// Debounced emit for IPS range filter
const debouncedIpsRangeUpdate = useDebounceFn((value: [number, number]) => {
  emit("update:filters", { ...props.filters, ipsRange: value });
}, 10);

// Watch for external changes to props.filters.ipsRange
watch(() => props.filters.ipsRange, (newValue) => {
  localIpsRange.value = newValue;
});

// Computed that updates local state immediately and emits with debounce
const ipsRange = computed({
  get: () => localIpsRange.value,
  set: (value) => {
    localIpsRange.value = value;
    debouncedIpsRangeUpdate(value);
  },
});

// DNB filter computed refs with null handling
const tauxReussiteRange = computed({
  get: () => props.filters.tauxReussiteRange || [TAUX_REUSSITE_MIN, TAUX_REUSSITE_MAX],
  set: (value) => {
    emit("update:filters", { ...props.filters, tauxReussiteRange: value });
  },
});

const valeurAjouteeRange = computed({
  get: () => props.filters.valeurAjouteeRange || [VALEUR_AJOUTEE_MIN, VALEUR_AJOUTEE_MAX],
  set: (value) => {
    emit("update:filters", { ...props.filters, valeurAjouteeRange: value });
  },
});

const noteEcritRange = computed({
  get: () => props.filters.noteEcritRange || [NOTE_ECRIT_MIN, NOTE_ECRIT_MAX],
  set: (value) => {
    emit("update:filters", { ...props.filters, noteEcritRange: value });
  },
});

const nbCandidatsRange = computed({
  get: () => props.filters.nbCandidatsRange || [NB_CANDIDATS_MIN, NB_CANDIDATS_MAX],
  set: (value) => {
    emit("update:filters", { ...props.filters, nbCandidatsRange: value });
  },
});

// Available regions based on location mode
const availableRegions = computed(() => {
  if (locationMode.value === "all") {
    return [...METROPOLITAN_REGIONS, ...DROM_COM_REGIONS];
  }
  if (locationMode.value === "drom-com") {
    return DROM_COM_REGIONS;
  }
  return METROPOLITAN_REGIONS;
});

const regionOptions = computed(() =>
  availableRegions.value.map(r => ({ label: formatRegionName(r), value: r })),
);

const hasActiveFilters = computed(() => {
  return props.filters.regions.length > 0
    || props.filters.secteur !== ""
    || props.filters.ipsRange[0] !== IPS_MIN
    || props.filters.ipsRange[1] !== IPS_MAX
    || props.filters.search !== ""
    || props.filters.locationMode !== "metropolitan"
    || props.filters.tauxReussiteRange !== null
    || props.filters.valeurAjouteeRange !== null
    || props.filters.noteEcritRange !== null
    || props.filters.nbCandidatsRange !== null;
});

// Watch for location mode changes and clean up selected regions
watch(locationMode, (newValue) => {
  if (newValue === "metropolitan") {
    // Remove DROM-COM regions when switching to metropolitan only
    const filteredRegions = regions.value.filter(r => !DROM_COM_REGIONS.includes(r));
    if (filteredRegions.length !== regions.value.length) {
      regions.value = filteredRegions;
    }
  } else if (newValue === "drom-com") {
    // Remove metropolitan regions when switching to DROM-COM only
    const filteredRegions = regions.value.filter(r => DROM_COM_REGIONS.includes(r));
    if (filteredRegions.length !== regions.value.length) {
      regions.value = filteredRegions;
    }
  }
});

// Accordion items
const accordionItems: AccordionItem[] = [
  {
    label: "Indice de Position Sociale (IPS)",
    value: "ips",
    icon: "i-lucide-bar-chart-3",
    slot: "ips",
  },
  {
    label: "Localisation",
    value: "localisation",
    icon: "i-lucide-map-pin",
    slot: "localisation",
  },
  {
    label: "Type d'établissement",
    value: "type",
    icon: "i-lucide-building-2",
    slot: "type",
  },
  {
    label: "Résultats DNB 2024",
    value: "dnb",
    icon: "i-lucide-graduation-cap",
    slot: "dnb",
  },
];

// Functions to enable/disable DNB filters
function enableTauxReussite() {
  if (!props.filters.tauxReussiteRange) {
    tauxReussiteRange.value = [TAUX_REUSSITE_MIN, TAUX_REUSSITE_MAX];
  }
}

function disableTauxReussite() {
  emit("update:filters", { ...props.filters, tauxReussiteRange: null });
}

function enableValeurAjoutee() {
  if (!props.filters.valeurAjouteeRange) {
    valeurAjouteeRange.value = [VALEUR_AJOUTEE_MIN, VALEUR_AJOUTEE_MAX];
  }
}

function disableValeurAjoutee() {
  emit("update:filters", { ...props.filters, valeurAjouteeRange: null });
}

function enableNoteEcrit() {
  if (!props.filters.noteEcritRange) {
    noteEcritRange.value = [NOTE_ECRIT_MIN, NOTE_ECRIT_MAX];
  }
}

function disableNoteEcrit() {
  emit("update:filters", { ...props.filters, noteEcritRange: null });
}

function enableNbCandidats() {
  if (!props.filters.nbCandidatsRange) {
    nbCandidatsRange.value = [NB_CANDIDATS_MIN, NB_CANDIDATS_MAX];
  }
}

function disableNbCandidats() {
  emit("update:filters", { ...props.filters, nbCandidatsRange: null });
}
</script>

<template>
  <div class="space-y-3">
    <!-- Reset -->
    <UButton
      icon="i-lucide-rotate-ccw"
      label="Réinitialiser les filtres"
      variant="outline"
      color="neutral"
      size="sm"
      block
      :disabled="!hasActiveFilters"
      @click="props.onReset"
    />

    <!-- Search (always visible) -->
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Rechercher un collège ou une ville…"
      class="w-full"
    >
      <template
        v-if="search?.length"
        #trailing
      >
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="i-lucide-circle-x"
          aria-label="Effacer la recherche"
          @click="search = ''"
        />
      </template>
    </UInput>

    <!-- Accordion Sections -->
    <UAccordion
      type="multiple"
      :items="accordionItems"
    >
      <!-- Localisation Section -->
      <template #localisation>
        <div class="px-2 pb-3 space-y-3">
          <!-- Location Type Selector (same pattern as Type d'établissement) -->
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-zinc-500 block">Territoire</label>
            <!-- Tous button (full width) -->
            <button
              class="w-full px-2 py-1.5 text-xs font-medium rounded-md transition-all border"
              :class="locationMode === 'all'
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
              @click="locationMode = 'all'"
            >
              Tout
            </button>

            <!-- Metropolitan / DROM-COM grid -->
            <div class="grid grid-cols-2 gap-1.5">
              <button
                class="w-full px-2 py-1.5 text-xs font-medium rounded-md transition-all border"
                :class="locationMode === 'metropolitan'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
                @click="locationMode = 'metropolitan'"
              >
                Métropole
              </button>
              <button
                class="w-full px-2 py-1.5 text-xs font-medium rounded-md transition-all border"
                :class="locationMode === 'drom-com'
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
                @click="locationMode = 'drom-com'"
              >
                DROM-COM
              </button>
            </div>
          </div>

          <!-- Region Select -->
          <div>
            <label class="text-xs font-medium text-zinc-500 mb-1.5 block">
              Région{{ regions.length > 0 ? `s (${regions.length})` : '' }}
            </label>
            <USelectMenu
              v-model="regions"
              :items="regionOptions"
              value-key="value"
              placeholder="Toutes les régions"
              size="sm"
              class="w-full"
              multiple
            />
          </div>
        </div>
      </template>

      <!-- Type Section -->
      <template #type>
        <div class="px-2 pb-3 space-y-1.5">
          <!-- Tous button (full width) -->
          <button
            class="w-full px-2 py-1.5 text-xs font-medium rounded-lg transition-all border"
            :class="secteur === '__all__'
              ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
            @click="secteur = '__all__'"
          >
            Tous
          </button>

          <!-- Public/Privé grid -->
          <div class="grid grid-cols-2 gap-1.5">
            <button
              class="w-full px-2 py-1.5 text-xs font-medium rounded-lg transition-all border"
              :class="secteur === 'public'
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
              @click="secteur = 'public'"
            >
              Public
            </button>
            <button
              class="w-full px-2 py-1.5 text-xs font-medium rounded-lg transition-all border"
              :class="secteur === 'privé sous contrat'
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'"
              @click="secteur = 'privé sous contrat'"
            >
              Privé
            </button>
          </div>
        </div>
      </template>

      <!-- IPS Section -->
      <template #ips>
        <div class="px-2 pb-3">
          <label class="text-xs font-medium text-zinc-500 mb-2 block">
            IPS: {{ ipsRange[0] }} – {{ ipsRange[1] }}
          </label>
          <div class="pb-2">
            <USlider
              v-model="ipsRange"
              color="neutral"
              size="sm"
              :min="IPS_MIN"
              :max="IPS_MAX"
              :step="5"
            />
          </div>
        </div>
      </template>

      <!-- DNB Section -->
      <template #dnb>
        <div class="px-2 pb-3 space-y-4">
          <!-- Taux de réussite -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-zinc-500">
                {{ filters.tauxReussiteRange ? `Taux de réussite: ${tauxReussiteRange[0]}% – ${tauxReussiteRange[1]}%` : 'Taux de réussite (%)' }}
              </label>
              <UButton
                v-if="!filters.tauxReussiteRange"
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="enableTauxReussite"
              />
              <UButton
                v-else
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="disableTauxReussite"
              />
            </div>
            <div
              v-if="filters.tauxReussiteRange"
              class="pb-2"
            >
              <USlider
                v-model="tauxReussiteRange"
                color="neutral"
                size="sm"
                :min="TAUX_REUSSITE_MIN"
                :max="TAUX_REUSSITE_MAX"
                :step="5"
              />
            </div>
          </div>

          <!-- Valeur ajoutée -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-zinc-500">
                {{ filters.valeurAjouteeRange ? `Valeur ajoutée: ${valeurAjouteeRange[0]} – ${valeurAjouteeRange[1]}` : 'Valeur ajoutée' }}
              </label>
              <UButton
                v-if="!filters.valeurAjouteeRange"
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="enableValeurAjoutee"
              />
              <UButton
                v-else
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="disableValeurAjoutee"
              />
            </div>
            <div
              v-if="filters.valeurAjouteeRange"
              class="pb-2"
            >
              <USlider
                v-model="valeurAjouteeRange"
                color="neutral"
                size="sm"
                :min="VALEUR_AJOUTEE_MIN"
                :max="VALEUR_AJOUTEE_MAX"
                :step="1"
              />
            </div>
          </div>

          <!-- Note écrit -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-zinc-500">
                {{ filters.noteEcritRange ? `Note écrit: ${noteEcritRange[0]} – ${noteEcritRange[1]} /20` : 'Note écrit (/20)' }}
              </label>
              <UButton
                v-if="!filters.noteEcritRange"
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="enableNoteEcrit"
              />
              <UButton
                v-else
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="disableNoteEcrit"
              />
            </div>
            <div
              v-if="filters.noteEcritRange"
              class="pb-2"
            >
              <USlider
                v-model="noteEcritRange"
                color="neutral"
                size="sm"
                :min="NOTE_ECRIT_MIN"
                :max="NOTE_ECRIT_MAX"
                :step="0.5"
              />
            </div>
          </div>

          <!-- Nb candidats -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-zinc-500">
                {{ filters.nbCandidatsRange ? `Nb candidats: ${nbCandidatsRange[0]} – ${nbCandidatsRange[1]}` : 'Nombre de candidats' }}
              </label>
              <UButton
                v-if="!filters.nbCandidatsRange"
                icon="i-lucide-plus"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="enableNbCandidats"
              />
              <UButton
                v-else
                icon="i-lucide-x"
                size="xs"
                color="neutral"
                variant="ghost"
                square
                @click="disableNbCandidats"
              />
            </div>
            <div
              v-if="filters.nbCandidatsRange"
              class="pb-2"
            >
              <USlider
                v-model="nbCandidatsRange"
                color="neutral"
                size="sm"
                :min="NB_CANDIDATS_MIN"
                :max="NB_CANDIDATS_MAX"
                :step="10"
              />
            </div>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>
