import { NextResponse } from "next/server";
import type { RecipeSearchResponse, RecipeSearchResult } from "@/lib/recipes/types";
import { findCuratedRecipes } from "@/lib/recipes/curated";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; value: RecipeSearchResponse }>();

type SpoonacularRecipe = {
  id: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
};

type SpoonacularSearchResponse = {
  results?: SpoonacularRecipe[];
  totalResults?: number;
};

function normalizeRecipe(recipe: SpoonacularRecipe): RecipeSearchResult {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image ?? null,
    readyInMinutes: recipe.readyInMinutes ?? null,
    servings: recipe.servings ?? null,
    cuisines: recipe.cuisines ?? [],
    dishTypes: recipe.dishTypes ?? [],
    diets: recipe.diets ?? [],
  };
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2 || query.length > 100) {
    return NextResponse.json(
      { error: "Enter a search between 2 and 100 characters." },
      { status: 400 },
    );
  }

  const cacheKey = query.toLocaleLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.value, {
      headers: { "X-Ivy-Cache": "HIT" },
    });
  }

  // Fast-path: Check curated instant recipes for Ivy's favorite dishes
  const curatedMatches = findCuratedRecipes(query);

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    if (curatedMatches.length > 0) {
      const response: RecipeSearchResponse = {
        results: curatedMatches,
        totalResults: curatedMatches.length,
      };
      return NextResponse.json(response, { headers: { "X-Ivy-Source": "curated" } });
    }
    return NextResponse.json(
      { error: "Recipe search is not configured yet. Add SPOONACULAR_API_KEY to your local environment." },
      { status: 503 },
    );
  }

  const endpoint = new URL("https://api.spoonacular.com/recipes/complexSearch");
  endpoint.searchParams.set("apiKey", apiKey);
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("number", "6");
  endpoint.searchParams.set("addRecipeInformation", "true");
  endpoint.searchParams.set("instructionsRequired", "true");

  let upstream: Response | null = null;
  try {
    upstream = await fetch(endpoint, { cache: "no-store" });
  } catch {
    if (curatedMatches.length > 0) {
      return NextResponse.json({ results: curatedMatches, totalResults: curatedMatches.length });
    }
    return NextResponse.json(
      { error: "Recipe search is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }

  if (upstream.status === 402 || upstream.status === 429) {
    if (curatedMatches.length > 0) {
      return NextResponse.json({ results: curatedMatches, totalResults: curatedMatches.length });
    }
    return NextResponse.json(
      { error: "Today's recipe search limit has been reached. Please try again later." },
      { status: 429 },
    );
  }

  if (!upstream.ok) {
    if (curatedMatches.length > 0) {
      return NextResponse.json({ results: curatedMatches, totalResults: curatedMatches.length });
    }
    return NextResponse.json(
      { error: "We couldn't reach the recipe service. Please try again." },
      { status: 502 },
    );
  }

  let payload: SpoonacularSearchResponse;
  try {
    payload = (await upstream.json()) as SpoonacularSearchResponse;
  } catch {
    if (curatedMatches.length > 0) {
      return NextResponse.json({ results: curatedMatches, totalResults: curatedMatches.length });
    }
    return NextResponse.json(
      { error: "The recipe service returned an unreadable response." },
      { status: 502 },
    );
  }

  const upstreamNormalized = (payload.results ?? []).map(normalizeRecipe);

  // Merge curated first, then unique upstream results
  const seenIds = new Set<number>();
  const mergedResults: RecipeSearchResult[] = [];

  for (const item of [...curatedMatches, ...upstreamNormalized]) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      mergedResults.push(item);
    }
  }

  const response: RecipeSearchResponse = {
    results: mergedResults.slice(0, 6),
    totalResults: mergedResults.length,
  };

  searchCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value: response });
  return NextResponse.json(response, {
    headers: { "X-Ivy-Cache": "MISS" },
  });
}
