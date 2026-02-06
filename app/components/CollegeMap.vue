<script setup lang="ts">
import type { CollegeFeature } from "~/utils/types";
import maplibregl from "maplibre-gl";
import { getIpsColorStops, ipsColor, parseCollegeFeature } from "~/utils/colors";
import "maplibre-gl/dist/maplibre-gl.css";

const props = defineProps<{
  filteredFeatures: CollegeFeature[];
  selectedCollege: CollegeFeature | null;
  selectCollege: (f: CollegeFeature | null) => void;
  selectedRegions: string[];
  hasNonRegionFilters: boolean;
  totalCount: number;
  locationMode: "all" | "metropolitan" | "drom-com";
}>();

const mapContainer = ref<HTMLDivElement>();
const map = shallowRef<maplibregl.Map>();
const popup = shallowRef<maplibregl.Popup>();

const SOURCE_ID = "colleges";
const LAYER_ID = "colleges-circles";
const HIGHLIGHT_LAYER_ID = "colleges-highlight";

// France center
const INITIAL_CENTER: [number, number] = [2.3, 46.7];
const INITIAL_ZOOM = 5.5;

// Territory bounds for auto-zoom
const METROPOLITAN_BOUNDS = {
  center: [2.3, 46.7] as [number, number],
  zoom: 5.5,
};

// Highlight state
const isHighlighting = ref(false);

onMounted(() => {
  if (!mapContainer.value)
    return;

  const m = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        "carto-light": {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors © CARTO",
        },
      },
      layers: [{
        id: "carto-light-layer",
        type: "raster",
        source: "carto-light",
        minzoom: 0,
        maxzoom: 22,
      }],
      glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    },
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    minZoom: 3,
    maxZoom: 17,
    attributionControl: false,
  });

  m.addControl(new maplibregl.NavigationControl(), "bottom-right");
  m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

  m.on("load", () => {
    m.addSource(SOURCE_ID, {
      type: "geojson",
      data: buildGeoJSON(props.filteredFeatures),
      promoteId: "uai", // Use UAI as feature ID for feature-state
    });

    m.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          2,
          8,
          4,
          12,
          8,
          16,
          14,
        ],
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "ips"],
          ...getIpsColorStops(),
        ],
        "circle-opacity": 0.9,
      },
    });

    // Add highlight ring layer (initially hidden)
    m.addLayer({
      id: HIGHLIGHT_LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          10,
          8,
          16,
          12,
          24,
          16,
          36,
        ],
        "circle-color": "transparent",
        "circle-opacity": 0,
        "circle-stroke-width": 3,
        "circle-stroke-color": "#3b82f6",
        "circle-stroke-opacity": [
          "case",
          ["boolean", ["feature-state", "highlighting"], false],
          1,
          0,
        ],
      },
    });

    // Click handler
    m.on("click", LAYER_ID, (e) => {
      if (!e.features?.length)
        return;
      const feature = e.features[0];
      if (!feature)
        return;
      const college = parseCollegeFeature(feature);
      props.selectCollege(college);
    });

    // Hover cursor
    m.on("mouseenter", LAYER_ID, () => {
      m.getCanvas().style.cursor = "pointer";
    });
    m.on("mouseleave", LAYER_ID, () => {
      m.getCanvas().style.cursor = "";
      if (popup.value) {
        popup.value.remove();
        popup.value = undefined;
      }
    });

    // Tooltip on hover
    m.on("mousemove", LAYER_ID, (e) => {
      if (!e.features?.length)
        return;
      const feature = e.features[0];
      if (!feature?.properties)
        return;
      const featureProps = feature.properties;
      const coords = e.lngLat;

      if (popup.value)
        popup.value.remove();

      // Parse numeric values
      const ips = Number(featureProps.ips);
      const tauxReussite = featureProps.taux_reussite !== "null" && featureProps.taux_reussite !== null ? Number(featureProps.taux_reussite) : null;
      const valeurAjoutee = featureProps.valeur_ajoutee !== "null" && featureProps.valeur_ajoutee !== null ? Number(featureProps.valeur_ajoutee) : null;
      const noteEcrit = featureProps.note_ecrit !== "null" && featureProps.note_ecrit !== null ? Number(featureProps.note_ecrit) : null;
      const nbCandidats = featureProps.nb_candidats !== "null" && featureProps.nb_candidats !== null ? Number(featureProps.nb_candidats) : null;

      // Calculate mentions percentages
      const mentionsTb = featureProps.mentions_tb !== "null" && featureProps.mentions_tb !== null ? Number(featureProps.mentions_tb) : null;
      const mentionsB = featureProps.mentions_b !== "null" && featureProps.mentions_b !== null ? Number(featureProps.mentions_b) : null;
      const mentionsAb = featureProps.mentions_ab !== "null" && featureProps.mentions_ab !== null ? Number(featureProps.mentions_ab) : null;

      let mentionsHtml = "";
      if (nbCandidats && mentionsTb !== null) {
        const tbPct = (mentionsTb / nbCandidats) * 100;
        const bPct = ((mentionsB ?? 0) / nbCandidats) * 100;
        const abPct = ((mentionsAb ?? 0) / nbCandidats) * 100;
        const sansPct = 100 - tbPct - bPct - abPct;

        mentionsHtml = `
          <div class="mt-3">
            <div class="text-[10px] text-zinc-500 mb-1.5">Mentions</div>
            <div class="flex h-1.5 rounded-full overflow-hidden mb-1.5">
              <div style="width: ${sansPct}%; background-color: #d4d4d8" title="Sans: ${sansPct.toFixed(1)}%"></div>
              <div style="width: ${abPct}%; background-color: #fbbf24" title="AB: ${abPct.toFixed(1)}%"></div>
              <div style="width: ${bPct}%; background-color: #3b82f6" title="B: ${bPct.toFixed(1)}%"></div>
              <div style="width: ${tbPct}%; background-color: #10b981" title="TB: ${tbPct.toFixed(1)}%"></div>
            </div>
            <div class="flex gap-2 text-[9px] text-zinc-500">
              <span class="flex items-center gap-1">
                <span class="inline-block w-1.5 h-1.5 rounded-full" style="background-color: #d4d4d8"></span>Sans
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-1.5 h-1.5 rounded-full" style="background-color: #fbbf24"></span>AB
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-1.5 h-1.5 rounded-full" style="background-color: #3b82f6"></span>B
              </span>
              <span class="flex items-center gap-1">
                <span class="inline-block w-1.5 h-1.5 rounded-full" style="background-color: #10b981"></span>TB
              </span>
            </div>
          </div>
        `;
      }

      // DNB stats section - 2x2 grid
      let dnbStatsHtml = "";
      if (tauxReussite !== null || valeurAjoutee !== null || noteEcrit !== null || nbCandidats !== null) {
        const statsHtml = [];

        if (tauxReussite !== null) {
          statsHtml.push(`
            <div>
              <div class="text-lg font-bold text-zinc-900">${tauxReussite.toFixed(0)}<span class="text-sm">%</span></div>
              <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Réussite</div>
            </div>
          `);
        }

        if (valeurAjoutee !== null) {
          const vaColor = valeurAjoutee > 2 ? "#16a34a" : valeurAjoutee < -2 ? "#dc2626" : "#71717a";
          statsHtml.push(`
            <div>
              <div class="text-lg font-bold" style="color: ${vaColor}">${valeurAjoutee > 0 ? "+" : ""}${valeurAjoutee}</div>
              <div class="text-[10px] text-zinc-500 uppercase tracking-wider">VA</div>
            </div>
          `);
        }

        if (noteEcrit !== null) {
          statsHtml.push(`
            <div>
              <div class="text-lg font-bold text-zinc-900">${noteEcrit.toFixed(1)}<span class="text-sm">/20</span></div>
              <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Moyenne</div>
            </div>
          `);
        }

        if (nbCandidats !== null) {
          statsHtml.push(`
            <div>
              <div class="text-lg font-bold text-zinc-900">${nbCandidats}</div>
              <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Candidats</div>
            </div>
          `);
        }

        if (statsHtml.length > 0) {
          dnbStatsHtml = `
            <div class="grid grid-cols-2 gap-3 mt-3">
              ${statsHtml.join("")}
            </div>
          `;
        }
      }

      const ipsColorValue = ipsColor(ips);

      popup.value = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: "college-popup",
      })
        .setLngLat(coords)
        .setHTML(`
          <div class="font-medium text-sm">${featureProps.nom}</div>
          <div class="text-xs text-zinc-500">${featureProps.commune}</div>
          <div class="mt-2">
            <span class="text-2xl font-bold" style="color: ${ipsColorValue}">${ips.toFixed(0)}</span>
            <span class="text-xs text-zinc-500 ml-1">IPS</span>
          </div>
          ${dnbStatsHtml}
          ${mentionsHtml}
        `)
        .addTo(m);
    });
  });

  map.value = m;
});

// Update source when filtered features change
watch(() => props.filteredFeatures, (features) => {
  const m = map.value;
  if (!m || !m.isStyleLoaded())
    return;

  const source = m.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  if (source) {
    source.setData(buildGeoJSON(features));
  }

  // Calculate if filtered set is significantly smaller than total
  const filterRatio = props.totalCount > 0 ? features.length / props.totalCount : 1;
  const isSignificantFilter = filterRatio < 0.3; // Less than 30% of schools

  // Smart zoom logic
  if (props.selectedRegions.length > 0 && features.length > 0) {
    // Priority 1: Regions selected - zoom to regions
    const bounds = new maplibregl.LngLatBounds();
    features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates as [number, number]);
    });
    m.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 400, right: 50 },
      duration: 1000,
      maxZoom: 10,
    });
  } else if (props.hasNonRegionFilters && isSignificantFilter && features.length > 0) {
    // Priority 2: Other filters active AND results are geographically clustered
    const bounds = new maplibregl.LngLatBounds();
    features.forEach((feature) => {
      bounds.extend(feature.geometry.coordinates as [number, number]);
    });
    m.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 400, right: 50 },
      duration: 1000,
      maxZoom: 10,
    });
  } else if (!props.selectedRegions.length && !props.hasNonRegionFilters) {
    // Priority 3: No specific filters - zoom based on location mode
    if (props.locationMode === "metropolitan") {
      m.flyTo({
        center: METROPOLITAN_BOUNDS.center,
        zoom: METROPOLITAN_BOUNDS.zoom,
        duration: 1000,
      });
    } else if (props.locationMode === "drom-com" && features.length > 0) {
      // Zoom to show all DROM-COM territories
      const bounds = new maplibregl.LngLatBounds();
      features.forEach((feature) => {
        bounds.extend(feature.geometry.coordinates as [number, number]);
      });
      m.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 400, right: 100 },
        duration: 1000,
        maxZoom: 6,
      });
    } else {
      // All territories - show France + DROM-COM overview
      m.flyTo({
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        duration: 1000,
      });
    }
  }
  // If filters active but not significant (>30% of schools), don't zoom
}, { deep: false });

// Fly to selected college
watch(() => props.selectedCollege, (college) => {
  const m = map.value;
  if (!m || !college)
    return;

  m.flyTo({
    center: college.geometry.coordinates as [number, number],
    zoom: Math.max(m.getZoom(), 10),
    duration: 800,
  });
});

function buildGeoJSON(features: CollegeFeature[]) {
  return {
    type: "FeatureCollection" as const,
    features,
  };
}

// Highlight filtered colleges with ring that disappears after 3 seconds
function highlightFilteredColleges() {
  const m = map.value;
  if (!m || isHighlighting.value)
    return;

  isHighlighting.value = true;

  // Set feature-state for all filtered colleges
  props.filteredFeatures.forEach((feature) => {
    m.setFeatureState(
      { source: SOURCE_ID, id: feature.properties.uai },
      { highlighting: true },
    );
  });

  // Remove highlight after 1.5 seconds
  setTimeout(() => {
    props.filteredFeatures.forEach((feature) => {
      m.setFeatureState(
        { source: SOURCE_ID, id: feature.properties.uai },
        { highlighting: false },
      );
    });
    isHighlighting.value = false;
  }, 1500);
}

// Expose highlight function to parent
defineExpose({
  highlightFilteredColleges,
});

onUnmounted(() => {
  map.value?.remove();
});
</script>

<template>
  <div class="relative w-full h-full">
    <div
      ref="mapContainer"
      class="w-full h-full"
    />
  </div>
</template>

<style>
.college-popup .maplibregl-popup-content {
  padding: 10px 14px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-family: inherit;
  min-width: 300px;
  max-width: 350px;
}

.dark .college-popup .maplibregl-popup-content {
  background: #27272a;
  color: #fafafa;
}

.college-popup .maplibregl-popup-tip {
  display: none;
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
