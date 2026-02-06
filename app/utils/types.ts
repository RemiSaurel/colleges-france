export type { CollegeFeature, CollegeGeoJSON } from "../../server/utils/types";

export interface FilterState {
  regions: string[];
  secteur: string;
  ipsRange: [number, number];
  search: string;
  locationMode: "all" | "metropolitan" | "drom-com";
  // DNB filters (null = inactive/disabled)
  tauxReussiteRange: [number, number] | null;
  valeurAjouteeRange: [number, number] | null;
  noteEcritRange: [number, number] | null;
  nbCandidatsRange: [number, number] | null;
}

// IPS constants
export const IPS_MIN = 50;
export const IPS_MAX = 170;

// DNB constants
export const TAUX_REUSSITE_MIN = 0;
export const TAUX_REUSSITE_MAX = 100;
export const VALEUR_AJOUTEE_MIN = -20;
export const VALEUR_AJOUTEE_MAX = 20;
export const NOTE_ECRIT_MIN = 0;
export const NOTE_ECRIT_MAX = 20;
export const NB_CANDIDATS_MIN = 0;
export const NB_CANDIDATS_MAX = 300;

// DROM-COM regions (overseas territories)
export const DROM_COM_REGIONS: string[] = [
  "GUADELOUPE",
  "GUYANE",
  "LA REUNION",
  "MARTINIQUE",
  "MAYOTTE",
];

// Metropolitan France regions (excluding DROM-COM)
export const METROPOLITAN_REGIONS: string[] = [
  "AUVERGNE-RHONE-ALPES",
  "BOURGOGNE-FRANCHE-COMTE",
  "BRETAGNE",
  "CENTRE-VAL DE LOIRE",
  "CORSE",
  "GRAND EST",
  "HAUTS-DE-FRANCE",
  "ILE-DE-FRANCE",
  "NORMANDIE",
  "NOUVELLE-AQUITAINE",
  "OCCITANIE",
  "PAYS DE LA LOIRE",
  "PROVENCE-ALPES-COTE D'AZUR",
];

// All regions combined
export const REGIONS: string[] = [...METROPOLITAN_REGIONS, ...DROM_COM_REGIONS];

// Helper to format region names for display
export function formatRegionName(region: string): string {
  // Special case mappings for proper formatting
  const specialCases: Record<string, string> = {
    "AUVERGNE-RHONE-ALPES": "Auvergne-Rhône-Alpes",
    "BOURGOGNE-FRANCHE-COMTE": "Bourgogne-Franche-Comté",
    "BRETAGNE": "Bretagne",
    "CENTRE-VAL DE LOIRE": "Centre-Val de Loire",
    "CORSE": "Corse",
    "GRAND EST": "Grand Est",
    "GUADELOUPE": "Guadeloupe",
    "GUYANE": "Guyane",
    "HAUTS-DE-FRANCE": "Hauts-de-France",
    "ILE-DE-FRANCE": "Île-de-France",
    "LA REUNION": "La Réunion",
    "MARTINIQUE": "Martinique",
    "MAYOTTE": "Mayotte",
    "NORMANDIE": "Normandie",
    "NOUVELLE-AQUITAINE": "Nouvelle-Aquitaine",
    "OCCITANIE": "Occitanie",
    "PAYS DE LA LOIRE": "Pays de la Loire",
    "PROVENCE-ALPES-COTE D'AZUR": "Provence-Alpes-Côte d'Azur",
  };

  return specialCases[region] || region;
}
