export interface CollegeFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    uai: string;
    nom: string;
    commune: string;
    departement: string;
    code_departement: string;
    region: string;
    academie: string;
    secteur: string;
    ips: number;
    ecart_type_ips: number;
    taux_reussite: number | null;
    mentions_tb: number | null;
    mentions_b: number | null;
    mentions_ab: number | null;
    nb_candidats: number | null;
    valeur_ajoutee: number | null;
    note_ecrit: number | null;
  };
}

export interface CollegeGeoJSON {
  type: "FeatureCollection";
  features: CollegeFeature[];
  metadata: {
    total: number;
    ips_year: string;
    dnb_session: string;
    generated_at: string;
  };
}
