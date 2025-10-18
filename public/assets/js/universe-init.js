// === UNIVERSE-INIT.JS ===
// Spouští model vesmíru (desktop verze)

import { renderUniverse } from "./universe-core.js";

// 🌌 Cesta k datovému modelu (JSON)
const MODEL_URL = "./assets/models/dlouhovekost.json";

// 🔹 Načtení modelu a spuštění vizualizace
fetch(MODEL_URL)
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log("✅ Model dlouhověkosti načten:", data);
    renderUniverse(data);
  })
  .catch(err => console.error("❌ Nelze načíst model:", err));
