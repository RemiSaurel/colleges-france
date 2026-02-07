<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";
import { motion } from "motion-v";
import { formatFr, ipsColor } from "~/utils/colors";

const props = defineProps<{
  college: CollegeFeature | null;
  filteredFeatures: CollegeFeature[];
  stats: {
    count: number;
    countWithDnb: number;
    totalCandidats: number | null;
    avgIps: number;
    avgReussite: number | null;
    avgValeurAjoutee: number | null;
    avgNoteEcrit: number | null;
    minIps: number;
    maxIps: number;
  } | null;
  minimized: boolean;
  onToggleMinimized: () => void;
  onDeselectCollege: () => void;
  onHighlight: () => void;
}>();

// Tab items
const tabItems = computed(() => [
  {
    label: "Statistiques",
    icon: "i-lucide-bar-chart-3",
    value: "stats",
    slot: "stats",
  },
  {
    label: "Collège",
    icon: "i-lucide-building-2",
    value: "college",
    slot: "college",
  },
]);

// Active tab - default to 'stats' to show overall stats when no college is selected
const activeTab = ref<string>("stats");

// Watch for college selection changes - switch to college tab when a college is selected
watch(() => props.college, (newCollege, oldCollege) => {
  // Switch to college tab whenever a college is selected (except when deselecting)
  if (newCollege && (!oldCollege || newCollege.properties.uai !== oldCollege.properties.uai)) {
    activeTab.value = "college";
  } else if (!newCollege && oldCollege) {
    // Switch back to stats tab when deselecting a college
    activeTab.value = "stats";
  }
});

// Watch for filteredFeatures changes - switch to stats tab if filters change while on college tab
watch(() => props.filteredFeatures, (newFeatures, oldFeatures) => {
  // Switch to stats tab if filters change while on college tab (but not on initial load)
  if (oldFeatures && newFeatures && activeTab.value === "college") {
    activeTab.value = "stats";
  }
});

// College computed properties
const p = computed(() => props.college?.properties);

const mentionsPct = computed(() => {
  if (!p.value?.nb_candidats || !p.value?.mentions_tb)
    return null;

  const total = p.value.nb_candidats;
  const tb = ((p.value.mentions_tb ?? 0) / total) * 100;
  const b = ((p.value.mentions_b ?? 0) / total) * 100;
  const ab = ((p.value.mentions_ab ?? 0) / total) * 100;
  const sans = 100 - tb - b - ab;

  return { tb, b, ab, sans };
});

const vaLabel = computed(() => {
  const va = p.value?.valeur_ajoutee;
  if (va === null || va === undefined || Number.isNaN(va))
    return null;
  // Handle -0 case
  const vaNum = va === 0 ? 0 : va;
  if (vaNum > 2)
    return { text: `+${vaNum}`, color: "text-green-600", icon: "i-lucide-trending-up" };
  if (vaNum < -2)
    return { text: `${vaNum}`, color: "text-red-600", icon: "i-lucide-trending-down" };
  return { text: `${vaNum > 0 ? "+" : ""}${vaNum}`, color: "text-zinc-500", icon: "i-lucide-minus" };
});

// Stats computed properties
const count = computed(() => props.stats?.count ?? 0);
const countWithDnb = computed(() => props.stats?.countWithDnb ?? 0);
const avgIps = computed(() => props.stats?.avgIps ?? 0);
const minIps = computed(() => props.stats?.minIps ?? 0);
const maxIps = computed(() => props.stats?.maxIps ?? 0);
const avgReussite = computed(() => props.stats?.avgReussite);
const avgValeurAjoutee = computed(() => props.stats?.avgValeurAjoutee);
const avgNoteEcrit = computed(() => props.stats?.avgNoteEcrit);
const totalCandidats = computed(() => props.stats?.totalCandidats ?? null);
const hasDnbData = computed(() => avgReussite.value !== null || avgValeurAjoutee.value !== null || avgNoteEcrit.value !== null);

const dnbPercentage = computed(() => {
  if (count.value === 0)
    return 0;
  return Math.round((countWithDnb.value / count.value) * 100);
});

const ipsColorValue = computed(() => {
  return ipsColor(avgIps.value || 0);
});

// Helper to convert rgb(r,g,b) to rgba(r,g,b,alpha) for backgrounds
function rgbToRgba(rgb: string, alpha: number): string {
  const match = rgb.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!match)
    return rgb;
  return `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
}

// Check if selected college matches current filter criteria
const collegeMatchesFilters = computed(() => {
  if (!props.college)
    return true;
  const uai = props.college.properties.uai;
  return props.filteredFeatures.some(f => f.properties.uai === uai);
});

// Dynamic title and subtitle based on active tab
const cardTitle = computed(() => {
  if (activeTab.value === "college" && props.college) {
    return p.value?.nom ?? "Collège";
  }
  return "Aperçu des données";
});

const cardSubtitle = computed(() => {
  if (activeTab.value === "college" && props.college) {
    const parts = [p.value?.commune];
    if (p.value?.departement) {
      parts.push(p.value.departement);
    }
    return parts.filter(Boolean).join(" · ");
  }
  return "Vue d'ensemble";
});
</script>

<template>
  <div class="bg-white border border-zinc-200/90 rounded-2xl shadow-[0_4px_24px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 px-5 py-4 border-b border-zinc-200/90 bg-linear-to-b from-zinc-50/50 to-white">
      <div class="min-w-0 flex-1">
        <h3 class="font-bold text-base truncate text-zinc-900">
          {{ cardTitle }}
        </h3>
        <p class="text-xs text-zinc-500 truncate font-medium">
          {{ cardSubtitle }}
        </p>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <UButton
          :icon="props.minimized ? 'i-lucide-maximize-2' : 'i-lucide-minimize-2'"
          color="neutral"
          variant="ghost"
          size="sm"
          square
          :aria-label="props.minimized ? 'Agrandir' : 'Réduire'"
          class="hover:bg-zinc-100 transition-colors"
          @click="onToggleMinimized"
        />
      </div>
    </div>

    <!-- Tabs -->
    <motion.div
      :initial="false"
      :animate="{
        height: props.minimized ? 0 : 'auto',
        opacity: props.minimized ? 0 : 1,
      }"
      :transition="{
        height: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        },
        opacity: {
          duration: 0.2,
        },
      }"
      style="overflow: hidden"
    >
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        color="neutral"
        class="w-full gap-0"
        variant="link"
        :unmount-on-hide="false"
        :ui="{ list: 'rounded-none' }"
      >
        <!-- Deselect button in tab list trailing slot -->
        <template #list-trailing>
          <UButton
            v-if="college"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            square
            aria-label="Désélectionner le collège"
            @click="onDeselectCollege"
          />
        </template>

        <!-- Stats Tab Content -->
        <template #stats>
          <div class="p-4 space-y-4">
            <!-- Main Stats Row - College Count (2/3) + Highlight Button (1/3) -->
            <div class="grid grid-cols-3 gap-2">
              <!-- College Count Card (takes 2 columns) -->
              <div
                class="col-span-2 relative p-3 rounded-xl bg-linear-to-br from-zinc-50 to-white border border-zinc-200/60 group/card hover:border-zinc-300/80 transition-all duration-300"
              >
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <UIcon
                      name="i-lucide-school"
                      class="w-3 h-3 text-zinc-500"
                    />
                  </div>
                  <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Total</span>
                </div>
                <div class="text-3xl font-bold text-zinc-900 tracking-tight">
                  <AnimatedNumber :value="count" :decimals="0" />
                </div>
                <div class="text-xs text-zinc-500 mt-1">
                  Collèges
                </div>
              </div>

              <!-- Highlight Button (takes 1 column) -->
              <div class="flex items-stretch">
                <UButton
                  icon="i-lucide-scan"
                  color="neutral"
                  variant="soft"
                  size="xl"
                  class="w-full h-full flex flex-col items-center justify-center text-sm rounded-xl"
                  aria-label="Localiser les collèges filtrés"
                  @click="onHighlight"
                >
                  Localiser les collèges
                </UButton>
              </div>
            </div>

            <!-- IPS Section -->
            <div
              class="relative p-3 rounded-xl overflow-hidden border"
              :style="{
                background: avgIps ? `linear-gradient(to bottom right, ${rgbToRgba(ipsColorValue, 0.15)}, ${rgbToRgba(ipsColorValue, 0.35)})` : 'linear-gradient(to bottom right, #fafafa, #ffffff)',
                borderColor: avgIps ? rgbToRgba(ipsColorValue, 0.5) : '#e4e4e7',
              }"
            >
              <!-- Background glow effect -->
              <div
                class="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-40"
                :style="{ backgroundColor: ipsColorValue }"
              />

              <div class="relative">
                <div class="flex items-center justify-between mb-3 w-full">
                  <div class="flex items-center gap-2 flex-1">
                    <div
                      class="w-6 h-6 rounded-lg bg-white/60 backdrop-blur flex items-center justify-center"
                    >
                      <UIcon
                        name="i-lucide-bar-chart-2"
                        class="w-3 h-3"
                        :style="{ color: ipsColorValue }"
                      />
                    </div>
                    <span class="text-[10px] uppercase tracking-wider text-zinc-600 font-medium">Indice de Position Sociale</span>
                  </div>
                  <UTooltip
                    text="Indicateur synthétique de la position sociale des élèves"
                    :content="{ side: 'top' }"
                  >
                    <NuxtLink
                      to="/about"
                      class="text-zinc-700 hover:text-zinc-500 transition-colors"
                    >
                      <UIcon
                        name="i-lucide-help-circle"
                        class="w-3.5 h-3.5"
                      />
                    </NuxtLink>
                  </UTooltip>
                </div>

                <div class="flex items-baseline gap-2">
                  <span
                    class="text-4xl font-bold tracking-tight"
                    :style="{ color: ipsColorValue }"
                  >
                    <template v-if="avgIps">
                      <AnimatedNumber :value="avgIps" :decimals="0" />
                    </template>
                    <template v-else>
                      –
                    </template>
                  </span>
                  <span class="text-sm text-zinc-500">en moyenne</span>
                </div>

                <div class="mt-3 flex items-center gap-1 text-sm">
                  <span class="text-zinc-600">Plage :</span>
                  <span
                    v-if="minIps && maxIps"
                    class="font-semibold text-zinc-900"
                  >
                    <AnimatedNumber :value="minIps" :decimals="0" /> – <AnimatedNumber :value="maxIps" :decimals="0" />
                  </span>
                  <span
                    v-else
                    class="text-zinc-400"
                  >–</span>
                </div>
              </div>
            </div>

            <!-- DNB Stats -->
            <div
              v-if="hasDnbData"
              class="space-y-3"
            >
              <div class="flex items-center gap-2">
                <div class="h-px flex-1 bg-zinc-200" />
                <span class="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Résultats DNB 2024</span>
                <div class="h-px flex-1 bg-zinc-200" />
              </div>

              <!-- Secondary info: colleges with DNB data -->
              <div class="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <UIcon
                  name="i-lucide-graduation-cap"
                  class="w-3.5 h-3.5"
                />
                <span><AnimatedNumber :value="countWithDnb" :decimals="0" /> collèges avec données DNB (<AnimatedNumber :value="dnbPercentage" :decimals="0" />%)</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <!-- Réussite -->
                <div
                  class="p-4 rounded-xl bg-zinc-50 border border-zinc-200/40 text-center group/stat hover:border-zinc-300/60 transition-all"
                >
                  <div v-if="avgReussite !== null" class="text-3xl font-bold text-zinc-900">
                    <AnimatedNumber :value="avgReussite!" :decimals="0" /><span class="text-lg">%</span>
                  </div>
                  <div v-else class="text-sm text-zinc-400 py-2">
                    Aucune donnée
                  </div>
                  <div class="text-xs uppercase tracking-wider text-zinc-500 mt-2">
                    Réussite
                  </div>
                </div>

                <!-- Valeur Ajoutée -->
                <UTooltip
                  text="Différence entre résultats obtenus et attendus"
                  :content="{ side: 'bottom' }"
                >
                  <div
                    class="p-4 rounded-xl bg-zinc-50 border border-zinc-200/40 text-center group/stat hover:border-zinc-300/60 transition-all"
                    :class="{
                      'bg-emerald-50/50 border-emerald-200/40': avgValeurAjoutee !== null && avgValeurAjoutee !== undefined && avgValeurAjoutee > 2,
                      'bg-red-50/50 border-red-200/40': avgValeurAjoutee !== null && avgValeurAjoutee !== undefined && avgValeurAjoutee < -2,
                    }"
                  >
                    <div
                      v-if="avgValeurAjoutee === null || avgValeurAjoutee === undefined"
                      class="text-sm text-zinc-400 py-2"
                    >
                      Aucune donnée
                    </div>
                    <div
                      v-else
                      class="text-3xl font-bold"
                      :class="{
                        'text-emerald-600': avgValeurAjoutee > 2,
                        'text-red-600': avgValeurAjoutee < -2,
                        'text-zinc-900': avgValeurAjoutee >= -2 && avgValeurAjoutee <= 2,
                      }"
                    >
                      {{ avgValeurAjoutee > 0 ? '+' : '' }}<AnimatedNumber :value="avgValeurAjoutee" :decimals="1" />
                    </div>

                    <div class="text-xs uppercase tracking-wider text-zinc-500 mt-2 cursor-help">
                      VA
                    </div>
                  </div>
                </UTooltip>

                <!-- Note Écrit -->
                <div
                  class="p-4 rounded-xl bg-zinc-50 border border-zinc-200/40 text-center group/stat hover:border-zinc-300/60 transition-all"
                >
                  <div v-if="avgNoteEcrit !== null" class="text-3xl font-bold text-zinc-900">
                    <AnimatedNumber :value="avgNoteEcrit!" :decimals="1" /><span class="text-lg">/20</span>
                  </div>
                  <div v-else class="text-sm text-zinc-400 py-2">
                    Aucune donnée
                  </div>
                  <div class="text-xs uppercase tracking-wider text-zinc-500 mt-2">
                    Moyenne
                  </div>
                </div>

                <!-- Candidats -->
                <div
                  class="p-4 rounded-xl bg-zinc-50 border border-zinc-200/40 text-center group/stat hover:border-zinc-300/60 transition-all"
                >
                  <div v-if="totalCandidats !== null && totalCandidats > 0" class="text-3xl font-bold text-zinc-900">
                    <AnimatedNumber :value="totalCandidats" :decimals="0" />
                  </div>
                  <div v-else class="text-sm text-zinc-400 py-2">
                    Aucune donnée
                  </div>
                  <div class="text-xs uppercase tracking-wider text-zinc-500 mt-2">
                    Candidats
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- College Tab Content -->
        <template #college>
          <div class="p-4 space-y-4">
            <!-- Warning when college doesn't match filters -->
            <div
              v-if="!collegeMatchesFilters"
              class="flex items-center gap-2 px-2 py-1 rounded-md bg-amber-50 border border-amber-200"
            >
              <UIcon
                name="i-lucide-alert-circle"
                class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
              />
              <p class="text-xs text-amber-700">
                Ce collège ne correspond pas aux filtres actuels
              </p>
            </div>

            <!-- Secteur badges -->
            <div
              v-if="college"
              class="flex items-center justify-between gap-2 text-xs"
            >
              <span
                v-if="p!.academie"
                class="text-zinc-500"
              >
                Académie : {{ p!.academie }}
              </span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-zinc-50 text-zinc-700"
                :class="p!.secteur === 'public' ? '' : 'bg-amber-50 text-amber-700'"
              >
                {{ p!.secteur === 'public' ? 'Public' : 'Privé' }}
              </span>
            </div>

            <!-- IPS Section -->
            <div
              v-if="college"
              class="flex gap-4 items-center"
            >
              <!-- IPS Value -->
              <div class="shrink-0">
                <div class="flex items-baseline gap-2 mb-1">
                  <span
                    class="text-4xl font-bold"
                    :style="{ color: ipsColor(p!.ips) }"
                  >
                    {{ formatFr(p!.ips, 0) }}
                  </span>
                  <span class="text-xs text-zinc-500">IPS</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-zinc-500">
                  <span> Ecart-type : {{ formatFr(p!.ecart_type_ips, 1) }}</span>
                </div>
              </div>

              <!-- IPS Histogram -->
              <div class="flex-1 min-w-0">
                <IpsHistogram
                  :features="filteredFeatures"
                  :selected-ips="p!.ips"
                />
              </div>
            </div>

            <!-- DNB Results -->
            <template v-if="college && p!.taux_reussite !== null">
              <div class="pt-4 border-t border-zinc-200/80">
                <h4 class="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                  DNB 2024
                </h4>

                <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <div class="text-xl font-bold">
                      {{ formatFr(p!.taux_reussite!, 0) }}%
                    </div>
                    <div class="text-xs text-zinc-500">
                      Réussite
                    </div>
                  </div>
                  <div v-if="vaLabel">
                    <div
                      class="text-xl font-bold"
                      :class="vaLabel.color"
                    >
                      {{ vaLabel.text }}
                    </div>
                    <UTooltip
                      text="Différence entre résultats obtenus et attendus selon le profil des élèves"
                      :content="{ side: 'bottom', align: 'center', sideOffset: 4 }"
                    >
                      <div class="text-xs text-zinc-500 flex items-center gap-1 cursor-help">
                        Valeur ajoutée
                        <UIcon
                          name="i-lucide-help-circle"
                          class="w-3 h-3"
                        />
                      </div>
                    </UTooltip>
                  </div>
                  <div v-if="p!.note_ecrit !== null">
                    <div class="text-xl font-bold">
                      {{ formatFr(p!.note_ecrit!, 1) }}
                    </div>
                    <div class="text-xs text-zinc-500">
                      Note écrit /20
                    </div>
                  </div>
                  <div v-if="p!.nb_candidats !== null">
                    <div class="text-xl font-bold">
                      {{ p!.nb_candidats }}
                    </div>
                    <div class="text-xs text-zinc-500">
                      Candidats
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mentions bar -->
              <div
                v-if="mentionsPct"
              >
                <div class="text-xs font-medium text-zinc-500 mb-2">
                  Mentions
                </div>
                <div class="flex h-2 rounded-full overflow-hidden">
                  <div
                    class="bg-zinc-300"
                    :style="{ width: `${mentionsPct.sans}%` }"
                    :title="`Sans: ${mentionsPct.sans.toFixed(1)}%`"
                  />
                  <div
                    class="bg-amber-400"
                    :style="{ width: `${mentionsPct.ab}%` }"
                    :title="`AB: ${mentionsPct.ab.toFixed(1)}%`"
                  />
                  <div
                    class="bg-blue-500"
                    :style="{ width: `${mentionsPct.b}%` }"
                    :title="`B: ${mentionsPct.b.toFixed(1)}%`"
                  />
                  <div
                    class="bg-emerald-500"
                    :style="{ width: `${mentionsPct.tb}%` }"
                    :title="`TB: ${mentionsPct.tb.toFixed(1)}%`"
                  />
                </div>
                <div class="flex gap-3 mt-2 text-[10px] text-zinc-500">
                  <span class="flex items-center gap-1">
                    <span class="inline-block w-2 h-2 rounded-full bg-zinc-300" />Sans
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="inline-block w-2 h-2 rounded-full bg-amber-400" />AB
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="inline-block w-2 h-2 rounded-full bg-blue-500" />B
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="inline-block w-2 h-2 rounded-full bg-emerald-500" />TB
                  </span>
                </div>
              </div>
            </template>

            <template v-else-if="college">
              <div class="pt-4 border-t border-zinc-200/80">
                <p class="text-xs text-zinc-400 italic">
                  Résultats DNB 2024 non disponibles pour cet établissement.
                </p>
              </div>
            </template>

            <!-- No college selected message -->
            <div
              v-if="!college"
              class="text-center py-8 text-zinc-400"
            >
              <UIcon
                name="i-lucide-building-2"
                class="w-12 h-12 mx-auto mb-2 text-zinc-300"
              />
              <p class="text-sm">
                Sélectionnez un collège sur la carte
              </p>
            </div>
          </div>
        </template>
      </UTabs>
    </motion.div>
  </div>
</template>
