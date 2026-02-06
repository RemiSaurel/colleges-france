import type maplibregl from "maplibre-gl";
import type { CollegeFeature } from "./types";

/**
 * Returns a CSS color for an IPS value on a diverging scale.
 * Low IPS (disadvantaged) → warm red/orange
 * Mid IPS (~105) → yellow/green
 * High IPS (advantaged) → cool blue/teal
 */
export function ipsColor(ips: number): string {
  const t = Math.max(0, Math.min(1, (ips - 60) / 100)); // 60-160 range → 0-1

  if (t < 0.35) {
    // Red to orange (60-95 IPS)
    const r = 220;
    const g = Math.round(50 + t * (170 / 0.35)); // 50 → 220
    const b = 40;
    return `rgb(${r},${g},${b})`;
  }
  if (t < 0.5) {
    // Orange to yellow (95-110 IPS) - smooth transition from orange
    const r = Math.round(220 - (t - 0.35) * (40 / 0.15)); // 220 → 180
    const g = 220;
    const b = 40;
    return `rgb(${r},${g},${b})`;
  }
  if (t < 0.65) {
    // Yellow to green/teal (110-125 IPS) - more vibrant green
    const r = Math.round(180 - (t - 0.5) * (100 / 0.15)); // 180 → 80
    const g = Math.round(220 - (t - 0.5) * (30 / 0.15)); // 220 → 190
    const b = Math.round(40 + (t - 0.5) * (180 / 0.15)); // 40 → 220
    return `rgb(${r},${g},${b})`;
  }
  // Teal to blue (125-160 IPS) - deeper blue
  const r = Math.round(80 - (t - 0.65) * (30 / 0.35)); // 80 → 50
  const g = Math.round(190 - (t - 0.65) * (70 / 0.35)); // 190 → 120
  const b = Math.round(220 + (t - 0.65) * (20 / 0.35)); // 220 → 240
  return `rgb(${r},${g},${b})`;
}

/**
 * Returns MapLibre color interpolation stops that match the ipsColor function
 */
export function getIpsColorStops(): Array<number | string> {
  return [
    60,
    ipsColor(60), // Red
    80,
    ipsColor(80), // Orange
    100,
    ipsColor(100), // Yellow
    115,
    ipsColor(115), // Green/Teal
    135,
    ipsColor(135), // Blue
    160,
    ipsColor(160), // Deep Blue
  ];
}

/**
 * IPS descriptor
 */
export function ipsLabel(ips: number | null | undefined): string {
  if (ips === null || ips === undefined || Number.isNaN(ips)) {
    return "–";
  }
  if (ips >= 130)
    return "Très favorisé";
  if (ips >= 115)
    return "Favorisé";
  if (ips >= 100)
    return "Intermédiaire";
  if (ips >= 85)
    return "Modeste";
  return "Très modeste";
}

/**
 * Format a number to French locale, or return '–' for invalid numbers
 */
export function formatFr(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "–";
  }
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse nullable numeric property from MapLibre feature
 */
function parseNullableNumber(value: string | number | null | undefined): number | null {
  if (value === "null" || value === null || value === undefined)
    return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

/**
 * Parse MapLibre feature properties into CollegeFeature
 * MapLibre stringifies GeoJSON properties, this function restores proper types
 */
export function parseCollegeFeature(feature: maplibregl.MapGeoJSONFeature): CollegeFeature {
  const props = feature.properties;

  return {
    type: "Feature",
    geometry: feature.geometry as CollegeFeature["geometry"],
    properties: {
      uai: props.uai,
      nom: props.nom,
      commune: props.commune,
      departement: props.departement,
      code_departement: props.code_departement,
      region: props.region,
      academie: props.academie,
      secteur: props.secteur,
      ips: Number(props.ips),
      ecart_type_ips: Number(props.ecart_type_ips),
      taux_reussite: parseNullableNumber(props.taux_reussite),
      mentions_tb: parseNullableNumber(props.mentions_tb),
      mentions_b: parseNullableNumber(props.mentions_b),
      mentions_ab: parseNullableNumber(props.mentions_ab),
      nb_candidats: parseNullableNumber(props.nb_candidats),
      valeur_ajoutee: parseNullableNumber(props.valeur_ajoutee),
      note_ecrit: parseNullableNumber(props.note_ecrit),
    },
  };
}
