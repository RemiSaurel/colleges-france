<script setup lang="ts">
const {
  data,
  status,
  error,
  filters,
  filteredFeatures,
  selectedCollege,
  stats,
  hasDnbFilters,
  hasNonRegionFilters,
  selectCollege,
  resetFilters,
} = useColleges();

const sidebarOpen = ref(true);
const isLargeScreen = ref(false);
const cardMinimized = ref(false); // Toggle minimize/maximize card
const collegeMapRef = ref<{ highlightFilteredColleges: () => void } | null>(null);

onMounted(() => {
  const checkScreenSize = () => {
    isLargeScreen.value = window.innerWidth >= 640;
  };
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  onUnmounted(() => window.removeEventListener("resize", checkScreenSize));
});

function deselectCollege() {
  selectCollege(null);
}

function toggleCardMinimized() {
  cardMinimized.value = !cardMinimized.value;
}

function handleHighlight() {
  collegeMapRef.value?.highlightFilteredColleges();
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Map area -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Loading overlay -->
      <div
        v-if="status === 'pending'"
        class="absolute inset-0 z-30 bg-white flex items-center justify-center"
      >
        <LoadingState :status="status" />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="absolute inset-0 z-20 flex items-center justify-center bg-white"
      >
        <div class="text-center max-w-md px-6">
          <UIcon
            name="i-lucide-alert-triangle"
            class="text-3xl text-red-500 mb-3"
          />
          <h2 class="font-semibold text-lg mb-2">
            Erreur de chargement
          </h2>
          <p class="text-sm text-zinc-500">
            Impossible de charger les données depuis l'API Éducation nationale.
            Veuillez réessayer.
          </p>
        </div>
      </div>

      <!-- Map -->
      <ClientOnly>
        <CollegeMap
          ref="collegeMapRef"
          :filtered-features="filteredFeatures"
          :selected-college="selectedCollege"
          :select-college="selectCollege"
          :selected-regions="filters.regions"
          :has-non-region-filters="hasNonRegionFilters"
          :total-count="data?.features.length || 0"
          :location-mode="filters.locationMode"
        />
      </ClientOnly>

      <!-- Toggle sidebar button — always visible when sidebar is closed (works for both mobile and desktop) -->
      <Transition name="fade">
        <button
          v-show="!sidebarOpen && status !== 'pending'"
          class="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-sm w-9 h-9 flex items-center justify-center border border-zinc-200/80 cursor-pointer hover:bg-zinc-50 transition-colors"
          aria-label="Ouvrir le panneau"
          @click="sidebarOpen = true"
        >
          <UIcon
            name="i-lucide-panel-left-open"
            class="text-lg"
          />
        </button>
      </Transition>

      <!-- Sidebar panel - Floating card -->
      <Transition name="slide-left">
        <div
          v-show="sidebarOpen && status !== 'pending'"
          class="absolute top-4 left-4 bottom-4 z-20 w-80 max-w-[calc(100vw-24px)] hidden sm:block"
        >
          <div class="bg-white rounded-lg shadow-lg border border-zinc-200/80 h-full overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="flex items-center gap-2 px-4 h-14 border-b border-zinc-200/80 flex-shrink-0">
              <NuxtLink
                to="https://remisaurel.dev"
                target="_blank"
              >
                <NuxtImg
                  src="/logo.png"
                  alt="Logo"
                  class="rounded-sm size-7"
                />
              </NuxtLink>
              <div class="flex-1" />
              <button
                class="rounded-md w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                aria-label="Fermer le panneau"
                @click="sidebarOpen = false"
              >
                <UIcon
                  name="i-lucide-panel-left-close"
                  class="text-base"
                />
              </button>
            </div>

            <!-- Scrollable content -->
            <div class="overflow-y-auto flex-1">
              <div class="p-4 space-y-6">
                <!-- Histogram -->
                <IpsHistogram
                  :features="filteredFeatures"
                  :selected-ips="selectedCollege?.properties.ips ?? null"
                />

                <!-- Filters -->
                <FilterSidebar
                  :filters="filters"
                  :has-dnb-filters="hasDnbFilters"
                  :on-reset="resetFilters"
                  @update:filters="(newFilters) => Object.assign(filters, newFilters)"
                />

                <!-- Footer links -->
                <div class="pt-4 space-y-2 border-t border-zinc-200/80">
                  <UButton
                    to="/about"
                    variant="link"
                    color="neutral"
                    size="sm"
                    block
                    label="À propos des données"
                    trailing-icon="i-lucide-arrow-up-right"
                  />
                  <UButton
                    to="https://github.com/remisaurel/educ"
                    target="_blank"
                    variant="link"
                    color="neutral"
                    size="sm"
                    block
                    label="Voir le code source"
                    trailing-icon="i-lucide-github"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Mobile sidebar (slideover) - only on screens < sm -->
      <ClientOnly>
        <USlideover
          v-if="!isLargeScreen && status !== 'pending'"
          v-model:open="sidebarOpen"
          side="left"
        >
          <template #title>
            <span class="sr-only">Filtres et statistiques</span>
          </template>
          <template #body>
            <div class="p-4">
              <p class="text-xs text-zinc-500 mb-4">
                Carte des collèges en France.
              </p>

              <IpsHistogram
                :features="filteredFeatures"
                :selected-ips="selectedCollege?.properties.ips ?? null"
              />

              <USeparator class="my-4" />

              <FilterSidebar
                :filters="filters"
                :has-dnb-filters="hasDnbFilters"
                :on-reset="resetFilters"
                @update:filters="(newFilters) => Object.assign(filters, newFilters)"
              />
            </div>
          </template>
        </USlideover>
      </ClientOnly>

      <!-- Right side card area - Unified Info Card with Tabs -->
      <div class="absolute top-4 right-4 z-10 w-80 sm:w-96 max-w-[calc(100vw-24px)]">
        <InfoCard
          :college="selectedCollege"
          :filtered-features="filteredFeatures"
          :stats="stats"
          :minimized="cardMinimized"
          :on-toggle-minimized="toggleCardMinimized"
          :on-deselect-college="deselectCollege"
          :on-highlight="handleHighlight"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
