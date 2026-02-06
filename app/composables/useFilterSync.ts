import type { FilterState } from "~/utils/types";
import {
  IPS_MAX,
  IPS_MIN,
  NB_CANDIDATS_MAX,
  NB_CANDIDATS_MIN,
  NOTE_ECRIT_MAX,
  NOTE_ECRIT_MIN,
  TAUX_REUSSITE_MAX,
  TAUX_REUSSITE_MIN,
  VALEUR_AJOUTEE_MAX,
  VALEUR_AJOUTEE_MIN,
} from "~/utils/types";

/**
 * Parse range string (e.g., "80-120") and clamp to min/max bounds
 */
function parseRange(value: string, min: number, max: number): [number, number] | null {
  const parts = value.split("-").map(Number);
  const rangeMin = parts[0];
  const rangeMax = parts[1];

  if (rangeMin === undefined || rangeMax === undefined || Number.isNaN(rangeMin) || Number.isNaN(rangeMax)) {
    return null;
  }

  return [
    Math.max(min, Math.min(max, rangeMin)),
    Math.max(min, Math.min(max, rangeMax)),
  ];
}

/**
 * Syncs FilterState with URL query parameters
 * Allows sharing filtered views and browser back/forward navigation
 */
export function useFilterSync(filters: FilterState) {
  const route = useRoute();
  const router = useRouter();

  // Parse URL query params on mount
  function parseQueryToFilters() {
    const query = route.query;

    // Regions (comma-separated)
    if (query.regions && typeof query.regions === "string") {
      filters.regions = query.regions.split(",").filter(Boolean);
    }

    // Secteur
    if (query.secteur && typeof query.secteur === "string") {
      filters.secteur = query.secteur;
    }

    // IPS Range (format: "80-120")
    if (query.ips && typeof query.ips === "string") {
      const range = parseRange(query.ips, IPS_MIN, IPS_MAX);
      if (range) {
        filters.ipsRange = range;
      }
    }

    // Search
    if (query.search && typeof query.search === "string") {
      filters.search = query.search;
    }

    // DNB Filters - Taux de réussite
    if (query.reussite && typeof query.reussite === "string") {
      const range = parseRange(query.reussite, TAUX_REUSSITE_MIN, TAUX_REUSSITE_MAX);
      if (range) {
        filters.tauxReussiteRange = range;
      }
    }

    // DNB Filters - Valeur ajoutée
    if (query.va && typeof query.va === "string") {
      const range = parseRange(query.va, VALEUR_AJOUTEE_MIN, VALEUR_AJOUTEE_MAX);
      if (range) {
        filters.valeurAjouteeRange = range;
      }
    }

    // DNB Filters - Note écrit
    if (query.note && typeof query.note === "string") {
      const range = parseRange(query.note, NOTE_ECRIT_MIN, NOTE_ECRIT_MAX);
      if (range) {
        filters.noteEcritRange = range;
      }
    }

    // DNB Filters - Nb candidats
    if (query.candidats && typeof query.candidats === "string") {
      const range = parseRange(query.candidats, NB_CANDIDATS_MIN, NB_CANDIDATS_MAX);
      if (range) {
        filters.nbCandidatsRange = range;
      }
    }
  }

  // Sync filters to URL query params
  function syncFiltersToQuery() {
    const query: Record<string, string> = {};

    // Regions
    if (filters.regions.length > 0) {
      query.regions = filters.regions.join(",");
    }

    // Secteur
    if (filters.secteur) {
      query.secteur = filters.secteur;
    }

    // IPS Range (only if not default)
    if (filters.ipsRange[0] !== IPS_MIN || filters.ipsRange[1] !== IPS_MAX) {
      query.ips = `${filters.ipsRange[0]}-${filters.ipsRange[1]}`;
    }

    // Search
    if (filters.search) {
      query.search = filters.search;
    }

    // DNB Filters (only if active/not null)
    if (filters.tauxReussiteRange) {
      query.reussite = `${filters.tauxReussiteRange[0]}-${filters.tauxReussiteRange[1]}`;
    }

    if (filters.valeurAjouteeRange) {
      query.va = `${filters.valeurAjouteeRange[0]}-${filters.valeurAjouteeRange[1]}`;
    }

    if (filters.noteEcritRange) {
      query.note = `${filters.noteEcritRange[0]}-${filters.noteEcritRange[1]}`;
    }

    if (filters.nbCandidatsRange) {
      query.candidats = `${filters.nbCandidatsRange[0]}-${filters.nbCandidatsRange[1]}`;
    }

    // Update URL without reloading page
    router.replace({ query });
  }

  // Debounced sync function (300ms)
  const debouncedSync = useDebounceFn(syncFiltersToQuery, 300);

  // Initialize from URL on mount
  onMounted(() => {
    parseQueryToFilters();
  });

  // Watch filter changes and sync to URL (debounced)
  watch(
    () => ({ ...filters }),
    debouncedSync,
    { deep: true },
  );

  return {
    parseQueryToFilters,
    syncFiltersToQuery,
  };
}
