import type { CollegeFeature } from "~/utils/types";

interface MentionsPct {
  tb: number;
  b: number;
  ab: number;
  sans: number;
}

interface VaLabel {
  text: string;
  color: string;
  icon: string;
}

export function useCollegeComparison() {
  /**
   * Calculate mentions percentages from a college's data
   */
  function getMentionsPct(college: CollegeFeature): MentionsPct | null {
    const p = college.properties;
    if (!p.nb_candidats || !p.mentions_tb)
      return null;

    const total = p.nb_candidats;
    const tb = ((p.mentions_tb ?? 0) / total) * 100;
    const b = ((p.mentions_b ?? 0) / total) * 100;
    const ab = ((p.mentions_ab ?? 0) / total) * 100;
    const sans = 100 - tb - b - ab;

    return { tb, b, ab, sans };
  }

  /**
   * Get valeur ajoutée label with color and icon
   */
  function getVaLabel(college: CollegeFeature): VaLabel | null {
    const va = college.properties.valeur_ajoutee;
    if (va === null || va === undefined || Number.isNaN(va))
      return null;

    const vaNum = va === 0 ? 0 : va;
    if (vaNum > 2)
      return { text: `+${vaNum}`, color: "text-green-600", icon: "i-lucide-trending-up" };
    if (vaNum < -2)
      return { text: `${vaNum}`, color: "text-red-600", icon: "i-lucide-trending-down" };
    return { text: `${vaNum > 0 ? "+" : ""}${vaNum}`, color: "text-zinc-500", icon: "i-lucide-minus" };
  }

  /**
   * Compare two values and return which college has the higher value
   * @returns 1 for college 1, 2 for college 2, or null if tied/invalid
   */
  function compareHigher(val1: number | null, val2: number | null): 1 | 2 | null {
    if (val1 === null || val2 === null)
      return null;
    if (val1 > val2)
      return 1;
    if (val2 > val1)
      return 2;
    return null;
  }

  /**
   * Check if a college is the winner for a specific metric
   */
  function isWinner(collegeIndex: 0 | 1, winner: 1 | 2 | null): boolean {
    if (winner === null)
      return false;
    return winner === collegeIndex + 1;
  }

  return {
    getMentionsPct,
    getVaLabel,
    compareHigher,
    isWinner,
  };
}
