// === UNIVERSE-ACCESS.JS ===
// Vrstva řízení přístupů nad vizualizací vesmíru

export function updateUniverseAccess(role = "guest") {
  console.log("🔐 updateUniverseAccess spuštěno pro roli:", role);

  const network = window.network;
  const data = window.MAIN_UNIVERSE_DATA;
  if (!network || !data) {
    console.warn("⚠️ Network nebo data nejsou k dispozici");
    return;
  }

  const nodesDS = network.body.data.nodes;
  const allNodes = nodesDS.get();

  // 🎯 Definuj přístupové úrovně
  const accessLevels = {
    guest: ["dlouhovekost", "zdravi"], // jen pár odemčených
    pro: data.map(n => n.id) // všechno
  };

  const allowed = new Set(accessLevels[role] || []);

  allNodes.forEach(node => {
    const isAllowed = allowed.has(node.id);
    const baseColor = node.color?.background || node.color || "#3b82f6";
    const muted = "#1e293b";

    nodesDS.update({
      id: node.id,
      color: isAllowed
        ? { background: baseColor, border: baseColor }
        : { background: muted, border: "#475569" },
      opacity: isAllowed ? 1 : 0.4,
      font: { color: isAllowed ? "#fff" : "#94a3b8" }
    });
  });

  console.log(`✅ Aplikován přístup pro '${role}' (${allowed.size} uzlů odemčeno)`);
}

// 🪄 Automaticky se spustí po vykreslení sítě
document.addEventListener("universeRendered", () => {
  console.log("🎯 Událost universeRendered zachycena → aktivuji access filtr (guest)");
  updateUniverseAccess("guest");
});
