// -------------------------------------------------------------
//  UNIVERSE INIT – načtení modelu a spuštění vizualizace
// -------------------------------------------------------------

console.log("🧠 universe-init.js start");

import { renderUniverse, setUniverseModel } from "./universe-core.js";
import { initUniversePanel } from "./universe-panel.js";

// -------------------------------------------------------------
// Načti index.json
// -------------------------------------------------------------
async function loadUniverseIndex() {
  const url = "./data/models/index.json";
  console.log("📄 Načítám index:", url);

  const res = await fetch(url);
  if (!res.ok) throw new Error("index.json nenalezen");
  return res.json();
}

// -------------------------------------------------------------
// Načti model
// -------------------------------------------------------------
async function loadModel(file) {
  console.log("📦 Načítám model:", file);

  const res = await fetch(file);
  if (!res.ok) throw new Error("model nenalezen");
  return res.json();
}

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
export async function initUniverse() {
  console.log("🚀 Inicializace longevity…");

  // počkej 1 frame → všechny moduly se načtou správně
  await new Promise(res => requestAnimationFrame(res));

  initUniversePanel();

  const index = await loadUniverseIndex();
  const firstModel = Object.keys(index)[0];
  const file = index[firstModel].modelFile;

  const model = await loadModel(file);

  setUniverseModel(model);

  // ROOT START
  renderUniverse("dlouhovekost");

  console.log("✅ Universe hotovo");
}

initUniverse();
