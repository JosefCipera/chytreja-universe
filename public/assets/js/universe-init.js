// === UNIVERSE-INIT.JS ===
// Spouští model vesmíru (desktop + mobil verze)

import { renderUniverse } from "./universe-core.js";

// 🌌 Výchozí model
let currentModel = "dlouhovekost";

// 🔹 Funkce pro načtení libovolného modelu
async function loadModel(modelName = "dlouhovekost") {
  const MODEL_URL = `./assets/models/${modelName}/${modelName}.json`;

  try {
    const response = await fetch(MODEL_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    console.log(`✅ Model "${modelName}" načten:`, data);
    renderUniverse(data);

    // Aktualizace titulku okna
    document.title = `Chytré Já – ${modelName === "toc" ? "TOC (Teorie omezení)" : "Model Dlouhověkosti"
      }`;

  } catch (err) {
    console.error(`❌ Nelze načíst model "${modelName}":`, err);
  }
}

// 🚀 Načti výchozí model (Dlouhověkost)
loadModel(currentModel);

// 🧭 Přepínání modelů (Dlouhověkost ↔ TOC)
document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("modelSelector");

  if (!selector) {
    console.warn("⚠️ Přepínač modelů (modelSelector) nebyl nalezen v HTML.");
    return;
  }

  selector.addEventListener("change", async (e) => {
    const selected = e.target.value;
    currentModel = selected;
    console.log("🔄 Přepínám na model:", selected);

    // Fade-out efekt
    const graph = document.getElementById("graphContainer");
    if (graph) graph.style.opacity = 0;

    setTimeout(async () => {
      await loadModel(selected);
      if (graph) graph.style.opacity = 1;
    }, 400);
  });
});
