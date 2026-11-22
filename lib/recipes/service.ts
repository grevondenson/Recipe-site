import type { Recipe, RecipeIngredient, RecipeStep } from "./types";
import { getCuratedRecipeById } from "./curated";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const recipeCache = new Map<number, { expiresAt: number; value: Recipe }>();

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getRecipeData(id: number): Promise<Recipe | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  // Check curated recipes first (instant response)
  const curated = getCuratedRecipeById(id);
  if (curated) {
    return curated;
  }

  // Check memory cache
  const cached = recipeCache.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return null;
  }

  const endpoint = new URL(`https://api.spoonacular.com/recipes/${id}/information`);
  endpoint.searchParams.set("apiKey", apiKey);
  endpoint.searchParams.set("includeNutrition", "true");

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, { cache: "no-store" });
  } catch {
    return null;
  }

  if (!upstream.ok) {
    return null;
  }

  try {
    const payload = (await upstream.json()) as {
      id: number;
      title: string;
      image?: string;
      readyInMinutes?: number;
      servings?: number;
      cuisines?: string[];
      dishTypes?: string[];
      diets?: string[];
      summary?: string;
      sourceName?: string;
      sourceUrl?: string;
      extendedIngredients?: Array<{
        id?: number;
        name?: string;
        amount?: number;
        measures?: {
          metric?: { amount?: number; unitShort?: string };
          us?: { amount?: number; unitShort?: string };
        };
        image?: string;
      }>;
      analyzedInstructions?: Array<{
        steps?: Array<{ number?: number; step?: string; equipment?: Array<{ name?: string }> }>;
      }>;
      nutrition?: { nutrients?: Array<{ name?: string; amount?: number }> };
    };

    const nutrients = new Map(
      (payload.nutrition?.nutrients ?? [])
        .filter((nutrient) => nutrient.name)
        .map((nutrient) => [nutrient.name!.toLowerCase(), nutrient.amount ?? null]),
    );

    const ingredients: RecipeIngredient[] = (payload.extendedIngredients ?? []).map(
      (ingredient, index) => ({
        id: ingredient.id ?? index,
        name: ingredient.name ?? "Ingredient",
        amount: ingredient.amount ?? 0,
        unit: ingredient.measures?.us?.unitShort ?? "",
        metric: {
          amount: ingredient.measures?.metric?.amount ?? ingredient.amount ?? 0,
          unit: ingredient.measures?.metric?.unitShort ?? "",
        },
        us: {
          amount: ingredient.measures?.us?.amount ?? ingredient.amount ?? 0,
          unit: ingredient.measures?.us?.unitShort ?? "",
        },
        image: ingredient.image
          ? `https://img.spoonacular.com/ingredients_100x100/${ingredient.image}`
          : null,
      }),
    );

    const steps: RecipeStep[] = (payload.analyzedInstructions?.[0]?.steps ?? []).map((step) => ({
      number: step.number ?? 0,
      text: step.step ?? "",
      equipment: (step.equipment ?? []).map((item) => item.name ?? "").filter(Boolean),
    }));

    const recipe: Recipe = {
      id: payload.id,
      title: payload.title,
      slug: slugify(payload.title),
      image: payload.image ?? null,
      readyInMinutes: payload.readyInMinutes ?? null,
      servings: payload.servings ?? 1,
      cuisines: payload.cuisines ?? [],
      dishTypes: payload.dishTypes ?? [],
      diets: payload.diets ?? [],
      summary: payload.summary ?? "",
      ingredients,
      steps,
      nutrition: payload.nutrition
        ? {
            calories: nutrients.get("calories") ?? null,
            protein: nutrients.get("protein") ?? null,
            carbs: nutrients.get("carbohydrates") ?? null,
            fat: nutrients.get("fat") ?? null,
          }
        : null,
      source: { name: payload.sourceName ?? null, url: payload.sourceUrl ?? null },
    };

    recipeCache.set(id, { expiresAt: Date.now() + CACHE_TTL_MS, value: recipe });
    return recipe;
  } catch {
    return null;
  }
}
