import type { CollegeFeature, CollegeGeoJSON, FilterState } from "~/utils/types";
import { DROM_COM_REGIONS, IPS_MAX, IPS_MIN, normalizeText } from "~/utils/types";

export function useColleges() {
  const { data, status, error } = useFetch<CollegeGeoJSON>("/api/colleges", {
    lazy: true,
  });

  const filters = reactive<FilterState>({
    regions: [],
    academies: [],
    secteur: "",
    ipsRange: [IPS_MIN, IPS_MAX],
    search: "",
    locationMode: "metropolitan",
    tauxReussiteRange: null,
    valeurAjouteeRange: null,
    noteEcritRange: null,
    nbCandidatsRange: null,
  });

  const selectedCollege = ref<CollegeFeature | null>(null);

  // Check if any DNB filter is active
  const hasDnbFilters = computed(() => {
    return filters.tauxReussiteRange !== null
      || filters.valeurAjouteeRange !== null
      || filters.noteEcritRange !== null
      || filters.nbCandidatsRange !== null;
  });

  // Check if any non-region filters are active (for smart zoom)
  const hasNonRegionFilters = computed(() => {
    return filters.secteur !== ""
      || filters.academies.length > 0
      || filters.ipsRange[0] !== IPS_MIN
      || filters.ipsRange[1] !== IPS_MAX
      || filters.search !== ""
      || hasDnbFilters.value;
  });

  const filteredFeatures = computed(() => {
    if (!data.value?.features)
      return [];

    return data.value.features.filter((f) => {
      const p = f.properties;

      // Location filters
      if (filters.regions.length > 0 && !filters.regions.includes(p.region))
        return false;
      if (filters.locationMode === "metropolitan" && DROM_COM_REGIONS.includes(p.region))
        return false;
      if (filters.locationMode === "drom-com" && !DROM_COM_REGIONS.includes(p.region))
        return false;
      if (filters.secteur && p.secteur !== filters.secteur)
        return false;

      // IPS filter
      if (p.ips < filters.ipsRange[0] || p.ips > filters.ipsRange[1])
        return false;

      // Académie filter
      if (filters.academies.length > 0 && !filters.academies.includes(p.academie))
        return false;

      // Search filter (accent-insensitive)
      if (filters.search) {
        const search = normalizeText(filters.search);
        const matchName = normalizeText(p.nom).includes(search);
        const matchCommune = normalizeText(p.commune).includes(search);
        if (!matchName && !matchCommune)
          return false;
      }

      // Exclude colleges without DNB data when any DNB filter is active
      if (hasDnbFilters.value && p.taux_reussite === null)
        return false;

      // DNB Filters - Taux de réussite
      if (filters.tauxReussiteRange) {
        const val = p.taux_reussite;
        if (val === null || val < filters.tauxReussiteRange[0] || val > filters.tauxReussiteRange[1]) {
          return false;
        }
      }

      // DNB Filters - Valeur ajoutée
      if (filters.valeurAjouteeRange) {
        const val = p.valeur_ajoutee;
        if (val === null || val < filters.valeurAjouteeRange[0] || val > filters.valeurAjouteeRange[1]) {
          return false;
        }
      }

      // DNB Filters - Note écrit
      if (filters.noteEcritRange) {
        const val = p.note_ecrit;
        if (val === null || val < filters.noteEcritRange[0] || val > filters.noteEcritRange[1]) {
          return false;
        }
      }

      // DNB Filters - Nb candidats
      if (filters.nbCandidatsRange) {
        const val = p.nb_candidats;
        if (val === null || val < filters.nbCandidatsRange[0] || val > filters.nbCandidatsRange[1]) {
          return false;
        }
      }

      return true;
    });
  });

  const stats = computed(() => {
    const features = filteredFeatures.value;
    if (!features.length)
      return null;

    const ipsValues = features.map(f => f.properties.ips);
    const avgIps = ipsValues.reduce((a, b) => a + b, 0) / ipsValues.length;

    // Filter colleges with DNB data
    const withDnbData = features.filter(f => f.properties.taux_reussite !== null);

    // Calculate DNB averages
    const avgReussite = withDnbData.length
      ? withDnbData.reduce((a, f) => a + (f.properties.taux_reussite ?? 0), 0) / withDnbData.length
      : null;

    const withVa = withDnbData.filter(f => f.properties.valeur_ajoutee !== null);
    const avgValeurAjoutee = withVa.length
      ? withVa.reduce((a, f) => a + (f.properties.valeur_ajoutee ?? 0), 0) / withVa.length
      : null;

    const withNote = withDnbData.filter(f => f.properties.note_ecrit !== null);
    const avgNoteEcrit = withNote.length
      ? withNote.reduce((a, f) => a + (f.properties.note_ecrit ?? 0), 0) / withNote.length
      : null;

    // Sum of nb_candidats across all colleges with DNB data
    const totalCandidats = withDnbData.length
      ? withDnbData.reduce((sum, f) => sum + (f.properties.nb_candidats ?? 0), 0)
      : null;

    return {
      count: features.length,
      countWithDnb: withDnbData.length,
      totalCandidats,
      avgIps: Math.round(avgIps * 10) / 10,
      avgReussite: avgReussite ? Math.round(avgReussite * 10) / 10 : null,
      avgValeurAjoutee: avgValeurAjoutee ? Math.round(avgValeurAjoutee * 10) / 10 : null,
      avgNoteEcrit: avgNoteEcrit ? Math.round(avgNoteEcrit * 10) / 10 : null,
      minIps: Math.round(Math.min(...ipsValues) * 10) / 10,
      maxIps: Math.round(Math.max(...ipsValues) * 10) / 10,
    };
  });

  function selectCollege(feature: CollegeFeature | null) {
    selectedCollege.value = feature;
  }

  function resetFilters() {
    filters.regions = [];
    filters.academies = [];
    filters.secteur = "";
    filters.ipsRange = [IPS_MIN, IPS_MAX];
    filters.search = "";
    filters.locationMode = "metropolitan";
    filters.tauxReussiteRange = null;
    filters.valeurAjouteeRange = null;
    filters.noteEcritRange = null;
    filters.nbCandidatsRange = null;
    selectedCollege.value = null;
  }

  return {
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
  };
}
