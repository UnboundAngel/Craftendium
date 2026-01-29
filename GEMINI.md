# Craftendium / Minecraft Tools Hub

**Project:** Craftendium (Minecraft Tools Hub)
**Type:** Static Web Application (HTML, CSS, JavaScript)
**Status:** Active / Maintenance
**Neoscript ID:** local-nRlbmRpdW0

## 1. Project Overview

Craftendium is a comprehensive collection of interactive tools for Minecraft players (Java and Bedrock editions). It functions as a static web application requiring no backend server (except for serving static files).

**Core Tech Stack:**
*   **HTML5/CSS3:** Modern, responsive design with a dark, Minecraft-themed aesthetic (Overworld/Nether themes).
*   **JavaScript (Vanilla):** Client-side logic for all calculators and tools.
*   **WebAssembly (WASM):** Uses `cubiomes.wasm` for high-performance, accurate Minecraft world generation (Seed Explorer).

## 2. Key Features (Tools)

The project consists of 11 core tools accessible via a unified hotbar:

1.  **🏠 HOME (`index.html`):** Main landing page/hub.
2.  **📖 JOURNAL (`minecraft_journal.html`):** Personal journaling tool.
3.  **📘 ENCHANT (`enchantment_calculator.html`):** XP cost calculator and optimization for enchantments.
4.  **💎 ORES (`ore_guide_page.html`):** Ore distribution charts and Y-level guides (1.18+).
5.  **🗺️ SEEDS (`world_seeds_page.html`):** Curated list of interesting seeds.
6.  **🧭 EXPLORER (`seed_explorer.html`):** Interactive map viewer using `cubiomes` to visualize biome generation and structures.
7.  **🗝️ BUILDS (`build_ideas_gallery.html`):** Gallery of building inspiration.
8.  **🌍 WORLDS (`minecraft_worlds.html`):** World management/notes.
9.  **🌾 FARMS (`farm_efficiency_page.html`):** Calculators for farm rates.
10. **🧪 POTIONS (`potion_brewing_guide.html`):** Brewing recipes and guides.
11. **🚇 NETHER (`nether_hub_calculator.html`):** Overworld <-> Nether coordinate calculator.

## 3. Architecture & File Structure

The project is structured as a collection of standalone HTML files, sharing some common assets and scripts.

*   **Root Directory:** Contains the main tools (e.g., `seed_explorer.html`, `minecraft-worldgen.js`, `app.js`).
*   **`minecraft-tools-hub/`:** A subdirectory containing some of the tool pages (legacy structure being unified).
*   **`app.js`:** Main application logic for the **Seed Explorer** tool. Defines `SeedExplorerApp` class.
*   **`renderer.js`:** Canvas rendering logic for the Seed Explorer map.
*   **`cubiomes.js` / `cubiomes.wasm`:** Interface to the C-based Cubiomes library for world generation.
*   **`worldgen-*.js`:** Strategies for world generation (real vs. fallback).
*   **`.neoscript/`:** Metadata for the Neoscript project manager.

## 4. Development Conventions

*   **Hotbar:** A unified, collapsible navigation bar is used across all pages. See `HOTBAR_UPDATE_GUIDE.md` for implementation details.
*   **Styling:**
    *   **Theme:** Dark mode ("Void" backgrounds).
    *   **Accents:** Purple (`#A066FF`) and Cyan (`#06b6d4`).
    *   **Fonts:** 'Inter' for UI, 'Courier New' for coordinates/data.
*   **JavaScript:** Modern ES6+ syntax. Classes used for complex logic (e.g., `SeedExplorerApp`).
*   **No Build Step:** The project is designed to run directly in the browser. No `npm build` or compilation is required (WASM is pre-compiled).

## 5. Running the Project

1.  **Local:** Simply open `index.html` (or any specific tool file) in a modern web browser.
2.  **Development:** It is recommended to use a local development server (e.g., `python -m http.server`, Live Server extension in VS Code) to ensure WASM modules load correctly, as browsers may block file protocol loading for some resources.

## 6. Known Issues / Notes

*   **WASM Dependency:** The Seed Explorer depends on `cubiomes.wasm`. If this fails to load (e.g., due to CORS on local file system), the app falls back to a JavaScript implementation (`worldgen-fallback.js`) which is an approximation.
*   **Directory Split:** Some HTML files are in the root, others in `minecraft-tools-hub/`. Ensure links in the hotbar are relative and correct for the specific page location.
