export type SceneId =
  | "kitchen"
  | "spice"
  | "grill"
  | "ocean"
  | "dessert"
  | "breakfast"
  | "greens";

export interface SceneConfig {
  id: SceneId;
  name: string;
  tagline: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  bgDark: string;
  particleColor: string;
  particleCount: number;
  lightColor: string;
  secondaryLight: string;
}

export const SCENES: Record<SceneId, SceneConfig> = {
  kitchen: {
    id: "kitchen",
    name: "Ivy's Kitchen",
    tagline: "Fresh botanicals, garden herbs, and calm culinary craft",
    accent: "#a3e635",
    accentSoft: "rgba(163, 230, 53, 0.16)",
    accentGlow: "rgba(163, 230, 53, 0.4)",
    bgDark: "#0d130a",
    particleColor: "#bef264",
    particleCount: 160,
    lightColor: "#f7fee7",
    secondaryLight: "#4d7c0f",
  },
  spice: {
    id: "spice",
    name: "Pilau & Warm Spices",
    tagline: "Cardamom pods, cloves, toasted cumin, and rich saffron aromatics",
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.16)",
    accentGlow: "rgba(245, 158, 11, 0.45)",
    bgDark: "#170f07",
    particleColor: "#fde68a",
    particleCount: 190,
    lightColor: "#fffbeb",
    secondaryLight: "#b45309",
  },
  grill: {
    id: "grill",
    name: "Grill & Embers",
    tagline: "Smoky nyama choma, charred cuts, crackling embers, and savory depth",
    accent: "#f97316",
    accentSoft: "rgba(249, 115, 22, 0.16)",
    accentGlow: "rgba(249, 115, 22, 0.45)",
    bgDark: "#170c07",
    particleColor: "#fdba74",
    particleCount: 180,
    lightColor: "#fff7ed",
    secondaryLight: "#c2410c",
  },
  ocean: {
    id: "ocean",
    name: "Ocean & Fresh Catch",
    tagline: "Whole grilled tilapia, citrus drizzle, cool tides, and ocean spray",
    accent: "#06b6d4",
    accentSoft: "rgba(6, 182, 212, 0.16)",
    accentGlow: "rgba(6, 182, 212, 0.42)",
    bgDark: "#061317",
    particleColor: "#67e8f9",
    particleCount: 170,
    lightColor: "#ecfeff",
    secondaryLight: "#0e7490",
  },
  dessert: {
    id: "dessert",
    name: "Sweet Cravings & Cream",
    tagline: "Velvety ice cream, melting drips, berry glazes, and confectionery joy",
    accent: "#ec4899",
    accentSoft: "rgba(236, 72, 153, 0.16)",
    accentGlow: "rgba(236, 72, 153, 0.42)",
    bgDark: "#180811",
    particleColor: "#f9a8d4",
    particleCount: 200,
    lightColor: "#fdf2f8",
    secondaryLight: "#be185d",
  },
  breakfast: {
    id: "breakfast",
    name: "Golden Mornings & Eggs",
    tagline: "Fluffy buttery scrambles, sunlit yolks, crisp toast, and breakfast warmth",
    accent: "#eab308",
    accentSoft: "rgba(234, 179, 8, 0.16)",
    accentGlow: "rgba(234, 179, 8, 0.42)",
    bgDark: "#151206",
    particleColor: "#fef08a",
    particleCount: 160,
    lightColor: "#fefce8",
    secondaryLight: "#a16207",
  },
  greens: {
    id: "greens",
    name: "Botanical Garden",
    tagline: "Crisp leafy salads, fresh basil, morning dew, and crisp greens",
    accent: "#22c55e",
    accentSoft: "rgba(34, 197, 94, 0.16)",
    accentGlow: "rgba(34, 197, 94, 0.42)",
    bgDark: "#08150c",
    particleColor: "#86efac",
    particleCount: 170,
    lightColor: "#f0fdf4",
    secondaryLight: "#15803d",
  },
};

export function detectScene(query: string, meta?: { cuisines?: string[]; dishTypes?: string[]; title?: string }): SceneId {
  const text = `${query} ${meta?.title ?? ""} ${(meta?.cuisines ?? []).join(" ")} ${(meta?.dishTypes ?? []).join(" ")}`.toLowerCase();

  // 1. Spice & Pilau
  if (/(pilau|rice|biryani|curry|masala|saffron|cardamom|cumin|spice|stew|ginger|turmeric)/i.test(text)) {
    return "spice";
  }

  // 2. Grill & Meat / Chicken
  if (/(choma|bbq|grill|steak|beef|chicken|roast|meat|skewer|ribs|pork|burger|kebab)/i.test(text)) {
    return "grill";
  }

  // 3. Ocean & Fish
  if (/(fish|tilapia|salmon|tuna|seafood|shrimp|prawn|crab|lobster|cod|calamari)/i.test(text)) {
    return "ocean";
  }

  // 4. Dessert & Ice Cream
  if (/(ice cream|dessert|cake|chocolate|sweet|cookie|tiramisu|sorbet|berry|vanilla|pastry|pudding)/i.test(text)) {
    return "dessert";
  }

  // 5. Breakfast & Eggs
  if (/(egg|omelette|breakfast|pancake|toast|brunch|waffle|bacon|scramble)/i.test(text)) {
    return "breakfast";
  }

  // 6. Greens & Salads
  if (/(salad|green|herb|spinach|kale|vegetable|vegan|bowl|basil|soup)/i.test(text)) {
    return "greens";
  }

  return "kitchen";
}
