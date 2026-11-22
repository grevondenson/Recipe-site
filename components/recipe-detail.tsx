"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Printer,
  Share2,
  Sparkles,
  Users,
  Utensils,
  X,
  Leaf,
} from "lucide-react";
import type { Recipe } from "@/lib/recipes/types";
import { detectScene } from "@/lib/scenes/registry";
import { CustomCursor } from "@/components/custom-cursor";
import { IngredientThumb } from "@/components/ingredient-thumb";

const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => <div className="scene-fallback" />,
});

export function RecipeDetail({ initialRecipe }: { initialRecipe: Recipe }) {
  const [servings, setServings] = useState(initialRecipe.servings);
  const [unit, setUnit] = useState<"metric" | "us">("metric");
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const [cookingMode, setCookingMode] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedToast, setCopiedToast] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");

  const scale = servings / (initialRecipe.servings || 1);

  // Determine active scene based on this recipe's flavor profile
  const sceneId = useMemo(() => {
    return detectScene("", {
      title: initialRecipe.title,
      cuisines: initialRecipe.cuisines,
      dishTypes: initialRecipe.dishTypes,
    });
  }, [initialRecipe]);

  // Load saved checked ingredients from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`ivy-ingredients-${initialRecipe.id}`);
      if (saved) setCheckedIngredients(JSON.parse(saved) as number[]);
    } catch {
      setCheckedIngredients([]);
    }
  }, [initialRecipe.id]);

  function toggleIngredient(index: number) {
    setCheckedIngredients((current) => {
      const next = current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index];
      try {
        window.localStorage.setItem(`ivy-ingredients-${initialRecipe.id}`, JSON.stringify(next));
      } catch {
        // ignore localStorage errors
      }
      return next;
    });
  }

  // Handle Cooking Mode Screen Wake Lock
  useEffect(() => {
    let wakeLockSentinel: any = null;

    async function requestWakeLock() {
      if (cookingMode && "wakeLock" in navigator) {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
          setWakeLockActive(true);
        } catch {
          setWakeLockActive(false);
        }
      }
    }

    if (cookingMode) {
      void requestWakeLock();
    } else {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
      setWakeLockActive(false);
    }

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [cookingMode]);

  // Keyboard navigation for cooking mode
  useEffect(() => {
    if (!cookingMode) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setActiveStepIndex((prev) => Math.min(initialRecipe.steps.length - 1, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveStepIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "Escape") {
        setCookingMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cookingMode, initialRecipe.steps.length]);

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2400);
      });
    }
  }

  const cleanSummary = useMemo(() => {
    return initialRecipe.summary.replace(/<[^>]+>/g, "").trim();
  }, [initialRecipe.summary]);

  return (
    <main className="recipe-page dark-theme">
      <CustomCursor />
      <HeroScene sceneId={sceneId} ambientMode={true} />

      {/* Toast Alert */}
      {copiedToast && (
        <div className="toast-notification" role="status">
          <Check size={16} /> Link copied to clipboard!
        </div>
      )}

      {/* Header Bar */}
      <header className="recipe-header">
        <Link className="brand recipe-brand" href="/" aria-label="Ivy Cooks home">
          <span className="brand-mark">
            <Leaf size={17} strokeWidth={1.8} />
          </span>
          <span className="brand-text">Ivy Cooks</span>
        </Link>

        <div className="recipe-header-actions">
          <button
            type="button"
            className="action-icon-btn"
            onClick={handleShare}
            aria-label="Share recipe link"
            title="Copy share link"
          >
            <Share2 size={15} />
            <span className="btn-label">Share</span>
          </button>
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => window.print()}
            aria-label="Print recipe"
            title="Print recipe"
          >
            <Printer size={15} />
            <span className="btn-label">Print</span>
          </button>
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> <span>Back to Kitchen</span>
          </Link>
        </div>
      </header>

      <article className="recipe-container">
        {/* Hero Section with Responsive Image Shrink & Fit Controls */}
        <section className="recipe-hero glass-card">
          {initialRecipe.image && (
            <div className={`recipe-hero-image-wrapper fit-${imageFit}`}>
              <div className="recipe-hero-image">
                <Image
                  src={initialRecipe.image}
                  alt={initialRecipe.title}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 860px) 100vw, 50vw"
                  className={`food-img-tag ${imageFit === "contain" ? "object-contain" : "object-cover"}`}
                />
              </div>

              {/* View / Shrink image control pill */}
              <button
                type="button"
                className="image-fit-control"
                onClick={() => setImageFit((prev) => (prev === "cover" ? "contain" : "cover"))}
                title={imageFit === "cover" ? "Fit whole image in frame" : "Fill frame"}
              >
                {imageFit === "cover" ? (
                  <>
                    <Minimize2 size={13} />
                    <span>Fit Frame</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={13} />
                    <span>Fill Frame</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="recipe-hero-copy">
            <div className="recipe-chips">
              <span className="recipe-chip special">
                <Sparkles size={11} className="inline mr-1" /> Handcrafted
              </span>
              {initialRecipe.cuisines.slice(0, 2).map((c) => (
                <span className="recipe-chip" key={c}>{c}</span>
              ))}
              {initialRecipe.diets.slice(0, 2).map((d) => (
                <span className="recipe-chip diet" key={d}>{d}</span>
              ))}
            </div>

            <h1>{initialRecipe.title}</h1>
            {cleanSummary && <p className="recipe-summary">{cleanSummary}</p>}

            <div className="recipe-detail-meta">
              {initialRecipe.readyInMinutes !== null && (
                <span><Clock3 size={15} className="text-accent" /> {initialRecipe.readyInMinutes} min</span>
              )}
              <span><Users size={15} className="text-accent" /> {servings} servings</span>
              {initialRecipe.nutrition?.calories && (
                <span><Flame size={15} className="text-accent" /> {initialRecipe.nutrition.calories} kcal/serving</span>
              )}
            </div>

            {/* Quick Cooking Mode Trigger Button */}
            {initialRecipe.steps.length > 0 && (
              <button
                type="button"
                className="start-cooking-btn"
                onClick={() => setCookingMode(true)}
              >
                <ChefHat size={18} />
                <span>Start Interactive Cooking Mode</span>
              </button>
            )}
          </div>
        </section>

        {/* Nutrition Snapshot Cards */}
        {initialRecipe.nutrition && (
          <section className="nutrition-snapshot" aria-label="Nutrition per serving">
            <div className="nutrition-card glass-card">
              <span className="nutrition-value">{initialRecipe.nutrition.calories ?? "—"}</span>
              <span className="nutrition-label">Calories</span>
            </div>
            <div className="nutrition-card glass-card">
              <span className="nutrition-value">
                {initialRecipe.nutrition.protein ? `${initialRecipe.nutrition.protein}g` : "—"}
              </span>
              <span className="nutrition-label">Protein</span>
            </div>
            <div className="nutrition-card glass-card">
              <span className="nutrition-value">
                {initialRecipe.nutrition.carbs ? `${initialRecipe.nutrition.carbs}g` : "—"}
              </span>
              <span className="nutrition-label">Carbs</span>
            </div>
            <div className="nutrition-card glass-card">
              <span className="nutrition-value">
                {initialRecipe.nutrition.fat ? `${initialRecipe.nutrition.fat}g` : "—"}
              </span>
              <span className="nutrition-label">Fat</span>
            </div>
          </section>
        )}

        {/* Recipe Content: Ingredients & Method Cards */}
        <section className="recipe-content">
          {/* Ingredients Panel */}
          <div className="ingredients-panel glass-card">
            <div className="section-heading">
              <div>
                <p>Mise en place</p>
                <h2>Ingredients</h2>
              </div>
              <div className="unit-toggle" aria-label="Ingredient units">
                <button
                  type="button"
                  className={unit === "metric" ? "active" : ""}
                  onClick={() => setUnit("metric")}
                >
                  Metric
                </button>
                <button
                  type="button"
                  className={unit === "us" ? "active" : ""}
                  onClick={() => setUnit("us")}
                >
                  US
                </button>
              </div>
            </div>

            {/* Servings Stepper */}
            <div className="servings-stepper" aria-label="Serving count">
              <span className="stepper-label">Servings to prepare:</span>
              <div className="stepper-controls">
                <button
                  type="button"
                  aria-label="Decrease servings"
                  onClick={() => setServings((value) => Math.max(1, value - 1))}
                >
                  <Minus size={15} />
                </button>
                <span className="stepper-count">{servings}</span>
                <button
                  type="button"
                  aria-label="Increase servings"
                  onClick={() => setServings((value) => Math.min(24, value + 1))}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <ul className="ingredient-list">
              {initialRecipe.ingredients.map((ingredient, index) => {
                const measure = unit === "metric" ? ingredient.metric : ingredient.us;
                const amount = (measure.amount || 0) * scale;
                const isChecked = checkedIngredients.includes(index);

                return (
                  <li key={`${ingredient.id}-${index}`} className="ingredient-item">
                    <button
                      type="button"
                      className={`ingredient-btn ${isChecked ? "checked" : ""}`}
                      onClick={() => toggleIngredient(index)}
                      aria-pressed={isChecked}
                    >
                      <span className="ingredient-check" aria-hidden="true">
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>

                      {/* Reliable Ingredient Thumbnail with TheMealDB / Emoji Fallback */}
                      <IngredientThumb name={ingredient.name} imageUrl={ingredient.image} />

                      <span className="ingredient-name">{ingredient.name}</span>
                      <span className="ingredient-amount">
                        {formatAmount(amount)} {measure.unit}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Method Panel */}
          <div className="method-panel glass-card">
            <div className="section-heading">
              <div>
                <p>Preparation</p>
                <h2>Method</h2>
              </div>
            </div>

            {initialRecipe.steps.length > 0 ? (
              <ol className="step-list">
                {initialRecipe.steps.map((step) => (
                  <li key={step.number} className="step-item">
                    <span className="step-num">{step.number}</span>
                    <div className="step-body">
                      <p>{step.text}</p>
                      {step.equipment.length > 0 && (
                        <div className="step-equipment">
                          <Utensils size={12} className="text-accent" />
                          <span>Tool: {step.equipment.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="missing-method">
                This recipe doesn&apos;t include structured steps.
                {initialRecipe.source.url && (
                  <> <a href={initialRecipe.source.url} target="_blank" rel="noreferrer">View the original method</a>.</>
                )}
              </p>
            )}

            {/* Serving Procedure & Notes */}
            <div className="serving-procedure-card">
              <h3>
                <Utensils size={18} className="text-accent" /> Plating & Serving Guide
              </h3>
              <p>
                Serve immediately while steaming hot. Accompany with warm artisanal sides, fresh herbs, and chilled beverages to elevate the dining moment.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="recipe-footer">
          <span>Ivy Cooks · Made with love</span>
          {initialRecipe.source.url && (
            <a href={initialRecipe.source.url} target="_blank" rel="noreferrer">
              Original Recipe Credit ({initialRecipe.source.name ?? "Source"})
            </a>
          )}
        </footer>
      </article>

      {/* Cooking Mode Fullscreen Overlay */}
      {cookingMode && (
        <div className="cooking-mode-overlay" role="dialog" aria-modal="true">
          <div className="cooking-mode-bar">
            <div className="cooking-mode-title">
              <ChefHat size={20} className="text-accent" />
              <span>Cooking Mode: {initialRecipe.title}</span>
            </div>
            <div className="cooking-mode-meta">
              {wakeLockActive && <span className="screen-awake-tag">Screen Awake</span>}
              <button
                type="button"
                className="close-cooking-btn"
                onClick={() => setCookingMode(false)}
                aria-label="Exit Cooking Mode"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="cooking-mode-card">
            <div className="cooking-step-badge">
              Step {activeStepIndex + 1} of {initialRecipe.steps.length}
            </div>

            <p className="cooking-step-text">
              {initialRecipe.steps[activeStepIndex]?.text}
            </p>

            {initialRecipe.steps[activeStepIndex]?.equipment.length > 0 && (
              <div className="cooking-step-tools">
                <Utensils size={14} />
                <span>
                  Tools needed: {initialRecipe.steps[activeStepIndex].equipment.join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="cooking-mode-nav">
            <button
              type="button"
              className="cooking-nav-btn"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft size={20} /> Previous Step
            </button>

            <span className="cooking-step-dots">
              {initialRecipe.steps.map((_, i) => (
                <span
                  key={i}
                  className={`cooking-dot ${i === activeStepIndex ? "active" : ""}`}
                  onClick={() => setActiveStepIndex(i)}
                />
              ))}
            </span>

            <button
              type="button"
              className="cooking-nav-btn primary"
              disabled={activeStepIndex === initialRecipe.steps.length - 1}
              onClick={() => setActiveStepIndex((prev) => Math.min(initialRecipe.steps.length - 1, prev + 1))}
            >
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function formatAmount(amount: number) {
  if (!Number.isFinite(amount)) return "";
  if (amount === 0) return "0";
  if (Math.abs(amount - Math.round(amount)) < 0.01) return String(Math.round(amount));
  return String(Math.round(amount * 100) / 100);
}
