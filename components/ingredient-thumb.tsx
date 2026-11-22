"use client";

import { useState } from "react";
import Image from "next/image";

function getIngredientFallbackEmoji(name: string): string {
  const n = name.toLowerCase();
  if (/(beef|steak|ribs|meat|pork)/.test(n)) return "🥩";
  if (/(chicken|poultry|turkey)/.test(n)) return "🍗";
  if (/(fish|tilapia|salmon|tuna|seafood|shrimp|prawn)/.test(n)) return "🐟";
  if (/(rice|basmati|grain|flour|pasta|noodle)/.test(n)) return "🍚";
  if (/(milk|cream|yogurt|dairy)/.test(n)) return "🥛";
  if (/(butter|margarine|ghee)/.test(n)) return "🧈";
  if (/(egg|yolk)/.test(n)) return "🥚";
  if (/(onion|shallot|leek)/.test(n)) return "🧅";
  if (/(garlic|ginger)/.test(n)) return "🧄";
  if (/(potato|yam)/.test(n)) return "🥔";
  if (/(tomato)/.test(n)) return "🍅";
  if (/(lemon|lime|citrus)/.test(n)) return "🍋";
  if (/(berry|raspberry|strawberry|blueberry)/.test(n)) return "🍓";
  if (/(spice|masala|cumin|cardamom|clove|cinnamon|pepper|turmeric|salt)/.test(n)) return "🧂";
  if (/(sugar|honey|syrup)/.test(n)) return "🍯";
  if (/(oil|olive oil|vinegar)/.test(n)) return "🫒";
  if (/(herb|parsley|cilantro|basil|rosemary|thyme|mint|chive)/.test(n)) return "🌿";
  if (/(bread|sourdough|toast|ladyfinger|biscuit)/.test(n)) return "🍞";
  if (/(cheese|mascarpone|parmesan)/.test(n)) return "🧀";
  if (/(chocolate|cocoa)/.test(n)) return "🍫";
  if (/(vanilla)/.test(n)) return "🌱";
  return "✨";
}

function getTheMealDbUrl(name: string): string {
  // Strip parentheses and descriptors
  const clean = name
    .replace(/\(.*?\)/g, "")
    .replace(/(fresh|cold|warm|diced|sliced|crushed|whole|pieces|large|medium|small)/gi, "")
    .trim()
    .split(/\s+/)[0];
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(clean)}-Small.png`;
}

export function IngredientThumb({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);

  // Source hierarchy:
  // 0: original URL (if provided and updated)
  // 1: TheMealDB CDN
  // 2: Fallback emoji badge
  const candidateUrls: string[] = [];
  if (imageUrl) candidateUrls.push(imageUrl);
  candidateUrls.push(getTheMealDbUrl(name));

  const currentUrl = candidateUrls[sourceIndex];

  if (!currentUrl || sourceIndex >= candidateUrls.length) {
    return (
      <div className="ingredient-thumb-badge" title={name} aria-hidden="true">
        <span>{getIngredientFallbackEmoji(name)}</span>
      </div>
    );
  }

  return (
    <div className="ingredient-thumb" title={name}>
      <Image
        src={currentUrl}
        alt={name}
        width={34}
        height={34}
        loading="lazy"
        unoptimized
        onError={() => setSourceIndex((prev) => prev + 1)}
        className="ingredient-img"
      />
    </div>
  );
}
