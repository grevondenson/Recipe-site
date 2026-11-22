# Ivy Cooks 🌿

A phone-first, 3D animated recipe sanctuary built with **Next.js (App Router)**, **React 19**, **Three.js / React Three Fiber**, **Tailwind CSS**, and the **Spoonacular Food API**.

## ✨ Features

- **Interactive 3D Scene Engine**: Procedural WebGL canvas rendered with React Three Fiber featuring 7 dynamic food-themed scenes (Swahili Pilau & Spices, Ember Grill, Ocean Catch, Sweet Desserts, Golden Breakfast Eggs, and Botanical Kitchen) that shift in real time based on what you search.
- **Dynamic Accent Synchronization**: Switching scenes automatically morphs theme accents, button glows, focus rings, and cursor halos.
- **Instant Recipe Loading (< 50ms)**: Zero-delay curated seed caching for favorite dishes with in-memory caching to protect API quotas.
- **Mobile-First & Touch Fluidity**:
  - Responsive image framing with an interactive **"Fit Frame" / "Fill Frame"** toggle.
  - Swipeable Craving Ticker with native momentum scrolling.
  - Multi-tier ingredient thumbnail resolution with TheMealDB CDN and culinary badge fallbacks.
- **Kitchen Cooking Mode**: Fullscreen distraction-free step-by-step assistant with oversized typography, arrow key navigation, and Screen Wake Lock API integration to prevent display timeout while cooking.
- **Recipe Customization**: Live servings scaling stepper, Metric/US unit toggle, persistent ingredient checklist, and nutrition snapshots.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env.local` and add your Spoonacular API key:
   ```bash
   SPOONACULAR_API_KEY="your_api_key_here"
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```
