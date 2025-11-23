import { renderUniverse } from "./universe-core.js";

console.log("✨ Spouštím Chytré Já – vesmír dlouhověkosti");

// 🧭 ADMIN režim (přepínatelné)
const isAdmin = localStorage.getItem("adminMode") === "true";

// 🧩 Inicializace
(async function initUniverse() {
  const modelName = localStorage.getItem("currentModel") || "dlouhovekost";
  const role = localStorage.getItem("userRole") || "demo";

  await loadAndRenderModel(modelName, role);
  initHeaderControls();
})();

// === 🌍 Načtení modelu a jeho vykreslení ===
async function loadAndRenderModel(modelName, role) {
  const sources = [
    `../data/models/${modelName}.json`,
  ];

  const model = await loadModel(sources);
  if (!model) return console.error(`❌ Nelze načíst model: ${modelName}`);

  window.MAIN_UNIVERSE_DATA = model;

  await applyAccessModel(role, model);
  renderVisibleUniverse(model);
  updateHeaderColor(role);
}

// === 💾 Načtení JSON modelu — TICHÁ varianta bez 404 v konzoli ===
async function loadModel(urls) {
  for (const url of urls) {
    try {
      // Nejprve zkusíme tichý HEAD request → ten NEVYPISUJE 404 chybu.
      const head = await fetch(url, { method: "HEAD" });

      if (!head.ok) continue; // soubor neexistuje → žádná chyba v konzoli

      // Soubor existuje → načteme JSON
      const res = await fetch(url);
      console.log(`✅ Model načten z: ${url}`);
      return await res.json();
    } catch (err) {
      // sem to nespadne v případě 404 → jen v případě síťové chyby
      console.warn(`⚠️ Nelze načíst z ${url}`);
    }
  }
  return null;
}

// === 🔐 Access varianta podle režimu ===
async function applyAccessModel(role, model) {
  const variantUrl = `../data/models/access-${role}.json`;
  try {
    const res = await fetch(variantUrl);
    if (!res.ok) {
      console.log(`⚠️ Access model ${variantUrl} nenalezen — ticho, používáme výchozí.`);
      return;
    }

    const accessData = await res.json();
    const accessMap = new Map(accessData.map(n => [n.id, n.access]));
    model.forEach(n => {
      n.access = accessMap.get(n.id) || "visible";
    });

    console.log(`🔐 Access model "${role}" načten – ${accessData.length} uzlů`);
  } catch (err) {
    console.warn(`❌ Chyba při načítání access modelu: ${role}`, err);
  }
}

// === 🌌 Vykreslení jen viditelných uzlů ===
function renderVisibleUniverse(model) {
  const visibleNodes = model.filter(n => n.access !== "hidden");
  const mainNode = visibleNodes.find(n => !n.parent) || visibleNodes[0];
  const firstLevel = visibleNodes.filter(
    n => n.id === mainNode.id || n.parent === mainNode.id
  );

  if (window.UNIVERSE_NETWORK) {
    window.UNIVERSE_NETWORK.destroy();
    window.UNIVERSE_NETWORK = null;
  }

  console.log(`🌌 Vykresluji vesmír (${visibleNodes.length} uzlů)`);
  renderUniverse(visibleNodes, firstLevel);
}

// === 🎛️ Přepínače v hlavičce ===
function initHeaderControls() {
  const roleSelect = document.getElementById("roleSelect");
  const modelSelect = document.getElementById("modelSelector");
  const headerControls = document.querySelector(".header-controls");

  if (!roleSelect || !modelSelect) return;

  // 🧠 Načti aktuální nastavení
  const role = localStorage.getItem("userRole") || "demo";
  const modelName = localStorage.getItem("currentModel") || "dlouhovekost";
  roleSelect.value = role;
  modelSelect.value = modelName;

  document.body.classList.add(role);

  // === 🎭 Režim "User" (čistý pohled) ===
  if (role === "user") {
    if (headerControls) headerControls.style.display = "none";
    console.log("👤 Režim 'user' – přepínače skryty, čisté UI.");
    return; // zastav inicializaci přepínačů
  }

  // === 🔄 Přepínání režimu ===
  updateHeaderColor(role);
  roleSelect.addEventListener("change", async (e) => {
    const newRole = e.target.value;
    localStorage.setItem("userRole", newRole);
    document.body.classList.remove("demo", "free", "pro", "user");
    document.body.classList.add(newRole);
    updateHeaderColor(newRole);

    if (newRole === "user") {
      if (headerControls) headerControls.style.display = "none";
      console.log("👤 Přepnuto na 'user' – přepínače skryty.");
      return location.reload();
    }

    if (window.MAIN_UNIVERSE_DATA) {
      await applyAccessModel(newRole, window.MAIN_UNIVERSE_DATA);
      renderVisibleUniverse(window.MAIN_UNIVERSE_DATA);
    }
  });

  // === 🔄 Přepínání modelu ===
  modelSelect.addEventListener("change", async (e) => {
    const newModel = e.target.value;
    localStorage.setItem("currentModel", newModel);
    const role = localStorage.getItem("userRole") || "demo";
    await loadAndRenderModel(newModel, role);
  });
}

// === 🎨 Barvy lišty podle režimu ===
function updateHeaderColor(role) {
  const header = document.getElementById("appHeader");
  if (!header) return;

  const colors = {
    demo: "rgba(59,130,246,0.25)",   // 💡 modrá
    free: "rgba(34,197,94,0.25)",    // 🧭 zelená
    pro: "rgba(251,191,36,0.25)",    // 🚀 zlatá
    user: "rgba(15,23,42,0.9)"       // 🔒 neutrální tmavá
  };

  header.style.background = colors[role] || "rgba(15,23,42,0.9)";
}
// 🧑‍💻 Trojitý klik pro vývojáře – návrat z režimu "user" do "demo"
let clickCount = 0;

document.getElementById("appTitle")?.addEventListener("click", () => {
  // reaguje jen v režimu user
  if (localStorage.getItem("userRole") !== "user") return;

  clickCount++;
  setTimeout(() => (clickCount = 0), 800); // reset po 0.8 s

  if (clickCount === 3) {
    console.log("🧠 Přepínám z režimu USER na DEMO...");
    localStorage.setItem("userRole", "demo");
    location.reload();
  }
});
