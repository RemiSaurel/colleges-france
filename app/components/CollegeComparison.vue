<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";
import { motion } from "motion-v";
import { useCollegeComparison } from "~/composables/useCollegeComparison";
import { formatFr, ipsColor } from "~/utils/colors";

const props = defineProps<{
  colleges: CollegeFeature[];
  onRemoveCollege: (uai: string) => void;
  onClearComparison: () => void;
}>();

const { getMentionsPct, getVaLabel, compareHigher, isWinner } = useCollegeComparison();

// Get colleges as tuple when we know there are exactly 2
const collegePair = computed(() => {
  if (props.colleges.length !== 2)
    return null;
  return [props.colleges[0], props.colleges[1]] as [CollegeFeature, CollegeFeature];
});

const firstCollege = computed(() => props.colleges[0] ?? null);

// Computed comparisons
const reussiteWinner = computed(() => {
  const pair = collegePair.value;
  if (!pair)
    return null;
  return compareHigher(pair[0].properties.taux_reussite, pair[1].properties.taux_reussite);
});

const valeurAjouteeWinner = computed(() => {
  const pair = collegePair.value;
  if (!pair)
    return null;
  return compareHigher(pair[0].properties.valeur_ajoutee, pair[1].properties.valeur_ajoutee);
});

const noteEcritWinner = computed(() => {
  const pair = collegePair.value;
  if (!pair)
    return null;
  return compareHigher(pair[0].properties.note_ecrit, pair[1].properties.note_ecrit);
});

const _candidatsWinner = computed(() => {
  const pair = collegePair.value;
  if (!pair)
    return null;
  return compareHigher(pair[0].properties.nb_candidats, pair[1].properties.nb_candidats);
});
</script>

<template>
  <motion.div
    :initial="{ y: 100, opacity: 0 }"
    :animate="{ y: 0, opacity: 1 }"
    :exit="{ y: 100, opacity: 0 }"
    :transition="{ type: 'spring', stiffness: 400, damping: 30 }"
    class="bg-white border-t border-zinc-200 shadow-lg rounded-t-xl sm:rounded-xl"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200/80 bg-zinc-50/50 rounded-t-xl">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-git-compare" class="w-5 h-5 text-zinc-600" />
        <h3 class="font-semibold text-sm text-zinc-900">
          Comparaison
        </h3>
        <span class="text-xs text-zinc-500">({{ colleges.length }}/2)</span>
      </div>
      <UButton
        icon="i-lucide-x"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        aria-label="Fermer la comparaison"
        @click="onClearComparison"
      />
    </div>

    <!-- Comparison Content -->
    <div class="p-4">
      <!-- Two Colleges Comparison -->
      <div v-if="collegePair" class="space-y-2">
        <!-- College Headers -->
        <div class="grid grid-cols-[1fr_auto_1fr] gap-0 pb-3 border-b border-zinc-200/80">
          <!-- College 1 Header -->
          <div class="pr-4 text-ellipsis overflow-hidden">
            <ComparisonHeader
              :college="collegePair[0]"
              align="right"
              @remove="onRemoveCollege"
            />
          </div>

          <!-- Vertical Separator -->
          <div class="w-px bg-zinc-200 mx-4" />

          <!-- College 2 Header -->
          <div class="pl-4 text-ellipsis overflow-hidden">
            <ComparisonHeader
              :college="collegePair[1]"
              align="left"
              @remove="onRemoveCollege"
            />
          </div>
        </div>

        <!-- IPS Row - No winner highlighting, just IPS colors -->
        <div class="grid grid-cols-[1fr_96px_1fr] gap-4 items-center">
          <!-- College 1 IPS -->
          <div class="text-right pr-4">
            <span
              class="text-lg font-bold"
              :style="{ color: ipsColor(collegePair[0].properties.ips) }"
            >
              {{ formatFr(collegePair[0].properties.ips, 0) }}
            </span>
          </div>

          <!-- Label -->
          <div class="text-center">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">IPS</span>
          </div>

          <!-- College 2 IPS -->
          <div class="text-left pl-4">
            <span
              class="text-lg font-bold"
              :style="{ color: ipsColor(collegePair[1].properties.ips) }"
            >
              {{ formatFr(collegePair[1].properties.ips, 0) }}
            </span>
          </div>
        </div>

        <!-- DNB Section -->
        <div v-if="collegePair[0].properties.taux_reussite !== null || collegePair[1].properties.taux_reussite !== null" class="pt-2 border-t border-zinc-200/60 space-y-3">
          <div class="text-center">
            <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Résultats DNB 2024</span>
          </div>

          <!-- Réussite Row -->
          <ComparisonRow
            v-if="collegePair[0].properties.taux_reussite !== null || collegePair[1].properties.taux_reussite !== null"
            label="Réussite"
            :college1="collegePair[0]"
            :college2="collegePair[1]"
            :value1="collegePair[0].properties.taux_reussite"
            :value2="collegePair[1].properties.taux_reussite"
            :winner="reussiteWinner"
            suffix="%"
          />

          <!-- Valeur Ajoutée Row -->
          <div v-if="getVaLabel(collegePair[0]) || getVaLabel(collegePair[1])" class="grid grid-cols-[1fr_96px_1fr] gap-4 items-center">
            <div class="text-right pr-4">
              <span
                v-if="getVaLabel(collegePair[0])"
                class="text-base font-semibold"
                :class="[getVaLabel(collegePair[0])?.color, { 'bg-green-50 px-2 py-0.5 rounded-md': isWinner(0, valeurAjouteeWinner) }]"
              >
                {{ getVaLabel(collegePair[0])?.text }}
              </span>
              <span v-else class="text-sm text-zinc-400">—</span>
            </div>
            <div class="text-center">
              <span class="text-xs font-medium text-zinc-500">Valeur ajoutée</span>
            </div>
            <div class="text-left pl-4">
              <span
                v-if="getVaLabel(collegePair[1])"
                class="text-base font-semibold"
                :class="[getVaLabel(collegePair[1])?.color, { 'bg-green-50 px-2 py-0.5 rounded-md': isWinner(1, valeurAjouteeWinner) }]"
              >
                {{ getVaLabel(collegePair[1])?.text }}
              </span>
              <span v-else class="text-sm text-zinc-400">—</span>
            </div>
          </div>

          <!-- Note Écrit Row -->
          <ComparisonRow
            v-if="collegePair[0].properties.note_ecrit !== null || collegePair[1].properties.note_ecrit !== null"
            label="Moyenne /20"
            :college1="collegePair[0]"
            :college2="collegePair[1]"
            :value1="collegePair[0].properties.note_ecrit"
            :value2="collegePair[1].properties.note_ecrit"
            :winner="noteEcritWinner"
            :decimals="1"
          />

          <!-- Candidats Row - No winner highlighting -->
          <ComparisonRow
            v-if="collegePair[0].properties.nb_candidats !== null || collegePair[1].properties.nb_candidats !== null"
            label="Candidats"
            :college1="collegePair[0]"
            :college2="collegePair[1]"
            :value1="collegePair[0].properties.nb_candidats"
            :value2="collegePair[1].properties.nb_candidats"
            :winner="_candidatsWinner"
            :highlight-winner="false"
            :formatter="(v: number) => v.toString()"
          />
        </div>

        <!-- Mentions Section -->
        <div v-if="getMentionsPct(collegePair[0]) || getMentionsPct(collegePair[1])" class="pt-2 border-t border-zinc-200/60">
          <div class="text-center mb-3">
            <span class="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Répartition des mentions</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- College 1 Mentions -->
            <div class="text-right pr-4">
              <MentionsBar
                :mentions="getMentionsPct(collegePair[0])"
                :show-legend="false"
                align="right"
              />
            </div>

            <!-- College 2 Mentions -->
            <div class="text-left pl-4">
              <MentionsBar
                :mentions="getMentionsPct(collegePair[1])"
                :show-legend="false"
                align="left"
              />
            </div>
          </div>

          <!-- Centered Legend -->
          <div class="mt-3 flex justify-center gap-4 text-[10px] text-zinc-500">
            <span class="flex items-center gap-1">
              <span class="inline-block w-2 h-2 rounded-full bg-zinc-300" />
              Sans
            </span>
            <span class="flex items-center gap-1">
              <span class="inline-block w-2 h-2 rounded-full bg-amber-400" />
              AB
            </span>
            <span class="flex items-center gap-1">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500" />
              B
            </span>
            <span class="flex items-center gap-1">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              TB
            </span>
          </div>
        </div>
      </div>

      <!-- Only 1 college selected -->
      <div v-else-if="firstCollege" class="text-center py-6">
        <div class="flex items-center justify-center gap-3 mb-3">
          <span class="font-medium text-lg text-zinc-700">{{ firstCollege.properties.nom }}</span>
        </div>
        <p class="text-sm text-zinc-400">
          Sélectionnez un 2ème collège sur la carte pour comparer
        </p>
      </div>

      <!-- No colleges selected - waiting for selection -->
      <div v-else class="text-center py-6">
        <UIcon
          name="i-lucide-git-compare"
          class="w-8 h-8 mx-auto mb-3 text-zinc-400"
        />
        <h3 class="font-semibold text-base text-zinc-900 mb-2">
          Comparer des collèges
        </h3>
        <p class="text-sm text-zinc-500">
          Sélectionnez 2 collèges sur la carte pour les comparer
        </p>
      </div>
    </div>
  </motion.div>
</template>
