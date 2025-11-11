// === DEMO-INIT.JS ===
// Jednoduché demo pro prezentaci vesmíru dlouhověkosti 🌌

import { renderUniverse } from "../universe-core.js";

console.log("🚀 Spouštím DEMO vesmíru...");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("./assets/js/demo/demo-universe.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("✅ Demo data načtena:", data.length, "uzlů");

    // 💡 vykreslíme vesmír až po načtení DOM
    renderUniverse(data);
  } catch (err) {
    console.error("❌ Chyba při načítání demo modelu:", err);
  }
});

