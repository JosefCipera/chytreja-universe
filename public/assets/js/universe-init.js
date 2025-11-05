// === UNIVERSE-INIT.JS ===
// Spouští model vesmíru (desktop + mobil verze)
console.group("🌌 Debug Universe Paths");
console.log("window.location.origin:", window.location.origin);
console.log("window.location.pathname:", window.location.pathname);
console.log("Aktuální URL stránky:", window.location.href);
console.groupEnd();

(async () => {
  const variants = [
    `${window.location.origin}/assets/models/dlouhovekost.json`,
    `${window.location.origin}/public/assets/models/dlouhovekost.json`,
    `${window.location.origin}/chytreja-universe/assets/models/dlouhovekost.json`,
    `${window.location.origin}/chytreja-universe/public/assets/models/dlouhovekost.json`,
  ];

  for (const url of variants) {
    try {
      const res = await fetch(url);
      console.log(url, res.status);
    } catch (e) {
      console.log(url, "❌ Fetch error", e);
    }
  }
})();

import { renderUniverse } from "./universe-core.js";

// 🌌 Výchozí model
let currentModel = "dlouhovekost";

// 🔹 Funkce pro načtení libovolného modelu
async function loadModel(modelName = "dlouhovekost") {
  // 💡 Automatická detekce správné cesty (lokál vs. Vercel)
  const basePath = window.location.pathname.includes("/public/")
    ? `${window.location.origin}/public/assets/models/`
    : `${window.location.origin}/assets/models/`;

  const MODEL_URL = `${basePath}${modelName}.json`;

  try {
    const response = await fetch(MODEL_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // 🔁 Automatické doplnění related podle parent
    const map = new Map();
    data.forEach(node => {
      if (!node.related) node.related = [];
      if (node.parent) {
        const parentNode = data.find(n => n.id === node.parent);
        if (parentNode) {
          if (!parentNode.related) parentNode.related = [];
          if (!parentNode.related.includes(node.id)) {
            parentNode.related.push(node.id);
          }
        }
      }
    });

    console.log(`✅ Model "${modelName}" načten z:`, MODEL_URL);
    // 🧭 Zobrazíme jen root + jeho přímé děti (1. úroveň)
    const root = data.find(n => n.id === "dlouhovekost") || data[0];

    // Najdi děti rootu (ty mají parent = root.id)
    const firstLevel = [root, ...data.filter(n => n.parent === root.id)];

    // Ať jsou mezi sebou propojené podle related
    if (!root.related || !root.related.length) {
      root.related = firstLevel.filter(n => n.id !== root.id).map(n => n.id);
    }

    // 🚀 Uložit dataset pro návraty
    window.MAIN_UNIVERSE_DATA = data;

    // 🚀 vykresli jen tuto část
    renderUniverse(data, firstLevel);

    // Aktualizace titulku okna
    document.title = `Chytré Já – ${modelName === "toc" ? "TOC (Teorie omezení)" : "Model Dlouhověkosti"
      }`;

    // 💬 Inicializace mini-AI helperu
    if (window.aiHelper) {
      console.log("🤖 Inicializuji AI Helper (mini mód).");
      // window.aiHelper.mini();
    }
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

  selector.addEventListener("change", async e => {
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

// Při zavření panelu schovej helper
document.addEventListener("DOMContentLoaded", () => {
  const closePanel = document.getElementById("closePanel");
  if (closePanel) {
    closePanel.addEventListener("click", () => {
      sidePanel.classList.remove("visible");
      const helper = document.getElementById("aiHelper");
      if (helper) {
        helper.classList.remove("expanded");
        helper.classList.add("mini");
      }
      sidePanel.classList.remove("chat-active");
    });
  }
});

// === 🧠 CHYTRÉ JÁ – logika mini + overlay ===
(() => {
  const miniInput = document.getElementById("aiMiniInput");
  const miniMic = document.getElementById("aiMiniMic");
  const overlay = document.getElementById("aiOverlay");
  const closeBtn = document.getElementById("aiClose");
  const chat = document.getElementById("aiChatWindow");
  const sendBtn = document.getElementById("aiSend");
  const micBtn = document.getElementById("aiMic");
  const input = document.getElementById("aiInput");

  if (!miniInput || !overlay) return;

  const appendMsg = (who, text) => {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  };

  const send = text => {
    if (!text) return;
    appendMsg("user", text);
    setTimeout(() => appendMsg("ai", `Zajímavé… ${text}? Pověz mi víc.`), 600);
  };

  miniInput.addEventListener("focus", () => overlay.classList.add("visible"));
  miniMic.addEventListener("click", () => overlay.classList.add("visible"));
  closeBtn.addEventListener("click", () => overlay.classList.remove("visible"));

  sendBtn.addEventListener("click", () => {
    send(input.value.trim());
    input.value = "";
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      send(input.value.trim());
      input.value = "";
    }
  });
})();

(() => {
  const input = document.getElementById("aiPanelInput");
  const send = document.getElementById("aiPanelSend");
  if (!input || !send) return;

  const ask = text => {
    if (!text) return;
    console.log("🧠 Chytré Já:", text);
    input.value = "";
  };

  send.addEventListener("click", () => ask(input.value.trim()));
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") ask(input.value.trim());
  });
})();
