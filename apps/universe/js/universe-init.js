// -------------------------------------------------------------
// UNIVERSE INIT – 1:1 čistá verze kompatibilní s public/universe
// -------------------------------------------------------------

import { renderVisibleUniverse } from "./universe-core.js";

// -------------------------------------------------------------
// 1) LOAD INDEX.JSON (hlavní registr modelů)
// -------------------------------------------------------------
async function loadUniverseIndex() {
  const url = "./data/models/index.json";

  console.log("📄 Načítám index.json:", url);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("index.json nenalezen");

    const data = await res.json();
    window.UNIVERSE_INDEX = data;
    return data;

  } catch (err) {
    console.error("❌ Nelze načíst index.json:", err);
    window.UNIVERSE_INDEX = null;
    return null;
  }
}

// -------------------------------------------------------------
// 2) LOAD MODEL (longevity.json / toc.json …)
// -------------------------------------------------------------
async function loadModel(path) {
  console.log("📦 Načítám model:", path);

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Model ${path} nenalezen`);

    return await res.json();

  } catch (err) {
    console.error("❌ Chyba při načítání modelu:", err);
    return null;
  }
}

// -------------------------------------------------------------
// 3) START SELECTED MODEL
// -------------------------------------------------------------
async function startModel(modelKey) {
  const cfg = window.UNIVERSE_INDEX?.[modelKey];

  if (!cfg) {
    console.error(`❌ Model '${modelKey}' nebyl nalezen v index.json`);
    return;
  }

  if (!cfg.modelFile) {
    console.error(`❌ Model '${modelKey}' nemá modelFile`);
    return;
  }

  const model = await loadModel(cfg.modelFile);
  if (!model) {
    console.error("❌ Model nelze načíst:", cfg.modelFile);
    return;
  }

  window.MAIN_UNIVERSE_DATA = model;

  console.log("🌌 Renderuji model:", modelKey);

  // → tady se volá čistá hierarchická verze (root + děti)
  renderVisibleUniverse(model);
}

// -------------------------------------------------------------
// 4) INIT – spustí celý systém
// -------------------------------------------------------------
export async function initUniverse() {
  console.log("🚀 Inicializace Universe…");

  const index = await loadUniverseIndex();

  if (!index) {
    console.error("❌ index.json nebyl načten");
    return;
  }

  // vezmeme první model z registru (longevity)
  const firstKey = Object.keys(index)[0];
  console.log("🔑 První model:", firstKey);

  await startModel(firstKey);

  console.log("✅ Universe hotovo");
}

// Automaticky spustíme
initUniverse();
