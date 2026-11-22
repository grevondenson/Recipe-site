export type RecipeSearchResult = {
  id: number;
  title: string;
  image: string | null;
  readyInMinutes: number | null;
  servings: number | null;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
};

export type RecipeSearchResponse = {
  results: RecipeSearchResult[];
  totalResults: number;
};

export type RecipeIngredient = {
  id: number;
  name: string;
  amount: number;
  unit: string;
  metric: { amount: number; unit: string };
  us: { amount: number; unit: string };
  image: string | null;
};

export type RecipeStep = {
  number: number;
  text: string;
  equipment: string[];
};

export type Recipe = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  readyInMinutes: number | null;
  servings: number;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  summary: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  nutrition: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  } | null;
  source: { name: string | null; url: string | null };
};
