"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, type FormEvent, useMemo, useRef } from "react";
import {
  ArrowDown,
  ArrowRight,
  Clock3,
  Leaf,
  Search,
  Sparkles,
  Users,
  Flame,
  Utensils,
} from "lucide-react";
import type { RecipeSearchResponse, RecipeSearchResult } from "@/lib/recipes/types";
import { detectScene, type SceneId } from "@/lib/scenes/registry";
import { CustomCursor } from "@/components/custom-cursor";

const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => (
    <div className="hero-scene">
      <div className="scene-fallback" />
    </div>
  ),
});

const FAVORITE_DISHES = [
  { label: "Swahili Pilau", icon: "✨", query: "Pilau" },
  { label: "Chicken Curry", icon: "🍗", query: "Chicken curry" },
  { label: "Grilled Fish", icon: "🐟", query: "Grilled fish" },
  { label: "Fluffy Eggs", icon: "🍳", query: "Eggs" },
  { label: "Vanilla Ice Cream", icon: "🍨", query: "Ice cream" },
  { label: "Nyama Choma", icon: "🔥", query: "Nyama choma" },
];

const ROTATING_PLACEHOLDERS = [
  "Try: Authentic Swahili Pilau…",
  "Try: Coconut Chicken Curry…",
  "Try: Crispy Pan-Seared Tilapia…",
  "Try: Fluffy Scrambled Eggs…",
  "Try: Madagascar Vanilla Ice Cream…",
  "Try: Grilled Nyama Choma…",
];

const AUTOCOMPLETE_ITEMS = [
  "Swahili Pilau",
  "Chicken curry",
  "Crispy tilapia fish",
  "French scrambled eggs",
  "Vanilla bean ice cream",
  "Smoky nyama choma",
  "Tiramisu al mascarpone",
  "Creamy garlic pasta",
  "Beef biryani",
  "Salmon with asparagus",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function HomeExperience() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecipeSearchResult[] | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeScene, setActiveScene] = useState<SceneId>("kitchen");
  const [isAmbient, setIsAmbient] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Rotating placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  // Filter autocomplete suggestions based on query
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1 || results !== null) return [];
    return AUTOCOMPLETE_ITEMS.filter(
      (item) => item.toLowerCase().includes(q) && item.toLowerCase() !== q,
    ).slice(0, 4);
  }, [query, results]);

  async function searchRecipes(searchTerm: string) {
    const normalizedQuery = searchTerm.trim();
    if (normalizedQuery.length < 2) {
      setMessage("Type at least two letters to find a recipe.");
      setResults(null);
      return;
    }

    setQuery(normalizedQuery);
    setMessage("");
    setIsLoading(true);
    setResults(null);

    // Smoothly shift 3D scene based on the craving
    const nextScene = detectScene(normalizedQuery);
    setActiveScene(nextScene);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(normalizedQuery)}`);
      const payload = (await response.json()) as RecipeSearchResponse | { error?: string };
      if (!response.ok) {
        setMessage("error" in payload && payload.error ? payload.error : "Search is unavailable right now.");
        return;
      }

      const searchResults = (payload as RecipeSearchResponse).results;
      setResults(searchResults);
      if (searchResults.length === 0) {
        setMessage("Nothing found. Try a simpler name or tap one of Ivy's favourites.");
      } else {
        // Refine scene based on top recipe's actual metadata
        const refinedScene = detectScene(normalizedQuery, {
          title: searchResults[0].title,
          cuisines: searchResults[0].cuisines,
          dishTypes: searchResults[0].dishTypes,
        });
        setActiveScene(refinedScene);
        setIsAmbient(true);

        // Smooth scroll to results
        setTimeout(() => {
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    } catch {
      setMessage("We couldn't connect to recipe search. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsFocused(false);
    void searchRecipes(query);
  }

  function handleSurpriseMe() {
    const randomPick = FAVORITE_DISHES[Math.floor(Math.random() * FAVORITE_DISHES.length)];
    setQuery(randomPick.query);
    void searchRecipes(randomPick.query);
  }

  return (
    <main className="home">
      <CustomCursor />
      <HeroScene sceneId={activeScene} ambientMode={isAmbient} />

      {/* Top HUD Nav Header */}
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ivy Cooks home">
          <span className="brand-mark">
            <Leaf size={17} strokeWidth={1.8} />
          </span>
          <span className="brand-text">Ivy Cooks</span>
        </Link>

        <nav className="header-nav" aria-label="Main navigation">
          <a href="#discover" onClick={() => setIsAmbient(false)}>Discover</a>
          <a href="#results">Recipes</a>
          <button
            type="button"
            className="hud-surprise-btn"
            onClick={handleSurpriseMe}
            title="Get instant recipe inspiration"
          >
            <Sparkles size={13} />
            <span>Surprise Ivy</span>
          </button>
        </nav>

        <div className="header-note">
          <span className="status-dot" />
          <span>Made for Ivy · Kitchen Live</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-content" id="discover">
        <div className="eyebrow-container">
          <p className="eyebrow">Personal Recipe Sanctuary</p>
          <span className="hero-badge">
            <Utensils size={12} /> Curated with love
          </span>
        </div>

        <h1 className="hero-title">
          A craving<br />worth <em>following.</em>
        </h1>

        <p className="hero-copy">
          Tell us what sounds delicious today. From aromatic Swahili pilau to crispy pan-seared tilapia and creamy gelato, your kitchen journey begins here.
        </p>

        {/* Hero Glass Search Bar */}
        <div className="search-container">
          <form
            className={`search-form ${isFocused ? "focused" : ""}`}
            role="search"
            onSubmit={handleSubmit}
          >
            <label className="sr-only" htmlFor="recipe-search">Search for a recipe</label>
            <Search className="search-icon" size={20} aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="recipe-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
              autoComplete="off"
            />
            <button
              type="submit"
              aria-label="Search recipes"
              disabled={isLoading}
              className="search-submit-btn"
            >
              {isLoading ? (
                <div className="spinner-dot" />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="autocomplete-panel" role="listbox">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className="autocomplete-option"
                  onMouseDown={() => {
                    setQuery(item);
                    void searchRecipes(item);
                  }}
                >
                  <Search size={13} className="text-muted" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ticker / Quick search chips of Ivy's favorites */}
        <div className="search-suggestions" aria-label="Ivy's favourites">
          <span className="suggestions-label">
            <Flame size={12} className="inline mr-1 text-accent" /> Ivy’s Craving Ticker:
          </span>
          {FAVORITE_DISHES.map((item) => (
            <button
              className="suggestion-chip"
              key={item.label}
              type="button"
              onClick={() => void searchRecipes(item.query)}
            >
              <span className="chip-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="hero-footnote">
          <span><ArrowDown size={14} /></span>
          <span>Explore recipes below or search any craving in real-time.</span>
        </div>
      </section>

      {/* Results Section */}
      {(results || message || isLoading) && (
        <section className="results-section" id="results" aria-live="polite">
          <div className="results-heading">
            <div>
              <p>From Ivy&apos;s Recipe Box</p>
              <h2>
                {results
                  ? `Recipes for “${query}”`
                  : isLoading
                  ? "Gathering delicious ideas…"
                  : "Let’s try that again"}
              </h2>
            </div>
            {results && <span className="results-count">{results.length} recipes found</span>}
          </div>

          {/* Skeletons while loading */}
          {isLoading && (
            <div className="recipe-grid skeleton-grid">
              {[1, 2, 3].map((n) => (
                <div className="recipe-card skeleton-card" key={n}>
                  <div className="skeleton-image" />
                  <div className="recipe-card-body">
                    <div className="skeleton-title" />
                    <div className="skeleton-meta" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && message && (
            <p className="search-message" data-kind={results !== null ? "info" : "error"} role="status">
              {message}
            </p>
          )}

          {/* Results Grid */}
          {!isLoading && results && results.length > 0 && (
            <div className="recipe-grid">
              {results.map((recipe) => (
                <Link
                  className="recipe-card"
                  href={`/recipe/${recipe.id}-${slugify(recipe.title)}`}
                  key={recipe.id}
                  aria-label={`Open ${recipe.title}`}
                >
                  <article>
                    <div className="recipe-image">
                      {recipe.image ? (
                        <Image
                          src={recipe.image}
                          alt={recipe.title}
                          fill
                          sizes="(max-width: 760px) 90vw, 30vw"
                        />
                      ) : (
                        <div className="recipe-image-placeholder">
                          <Leaf size={32} />
                        </div>
                      )}
                      <div className="card-badge">View Recipe</div>
                    </div>
                    <div className="recipe-card-body">
                      <h3>{recipe.title}</h3>
                      <div className="recipe-meta">
                        {recipe.readyInMinutes !== null && (
                          <span><Clock3 size={13} /> {recipe.readyInMinutes} min</span>
                        )}
                        {recipe.servings !== null && (
                          <span><Users size={13} /> {recipe.servings} servings</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="site-footer" id="about">
        <div className="footer-content">
          <span>Handcrafted with all my love for Ivy.</span>
          <span className="footer-divider">•</span>
          <a href="https://spoonacular.com/food-api" target="_blank" rel="noreferrer">
            Powered by Spoonacular Food API
          </a>
        </div>
      </footer>
    </main>
  );
}
