// -------------------------------------------------------------
// UNIVERSE CORE – 1:1 verze z public (bez úprav logiky)
// -------------------------------------------------------------

import { openMdViewer, openPdfViewer, openMediaViewer } from "./universe-viewers.js";
import { updateSidePanel } from "./universe-panel.js";

window.UNIVERSE_NETWORK = null;
let CURRENT_SUBSET = null;

// -------------------------------------------------------------
// ZÁKLADNÍ RENDER
// -------------------------------------------------------------
export function renderUniverse(allNodes, subset = null) {

  CURRENT_SUBSET = subset || allNodes;

  const nodes = new vis.DataSet(
    CURRENT_SUBSET.map(n => ({
      id: n.id,
      label: n.name,
      title: n.name,
      shape: "box",
      color: n.color || "#1e2a3a",
      font: { color: "#fff" }
    }))
  );

  const edges = new vis.DataSet(
    CURRENT_SUBSET
      .filter(n => n.parent)
      .map(n => ({
        from: n.parent,
        to: n.id
      }))
  );

  const container = document.getElementById("network");
  if (!container) {
    console.error("❌ #network element nenalezen");
    return;
  }

  const data = { nodes, edges };

  const options = {
    layout: {
      hierarchical: {
        enabled: true,
        levelSeparation: 180,
        nodeSpacing: 160,
        treeSpacing: 200,
        direction: "UD",
        sortMethod: "directed"
      }
    },
    physics: false,
    interaction: {
      hover: true,
      dragNodes: false
    }
  };

  window.UNIVERSE_NETWORK = new vis.Network(container, data, options);

  // Klik na uzel → panel
  window.UNIVERSE_NETWORK.on("click", function (params) {
    if (!params.nodes.length) return;
    const nodeId = params.nodes[0];
    const node = allNodes.find(n => n.id === nodeId);
    if (node) updateSidePanel(node, allNodes);
  });

  // Dvojklik → vstup do podsítě
  window.UNIVERSE_NETWORK.on("doubleClick", function (params) {
    if (!params.nodes.length) return;
    const nodeId = params.nodes[0];
    openSubUniverse(nodeId, allNodes);
  });
}

// -------------------------------------------------------------
// PODSÍTĚ (double-click)
// -------------------------------------------------------------
function openSubUniverse(nodeId, allNodes) {
  const subset = allNodes.filter(
    n => n.id === nodeId || n.parent === nodeId
  );

  renderUniverse(allNodes, subset);
}

// -------------------------------------------------------------
// NÁVRAT NA HLAVNÍ ÚROVEŇ – nepotřebuje tlačítko, při změně subsetu se přepisuje
// -------------------------------------------------------------
export function renderVisibleUniverse(model) {

  const visible = model.filter(n => n.access !== "hidden");

  const main = visible.find(n => !n.parent) || visible[0];

  const firstLevel = visible.filter(
    n => n.id === main.id || n.parent === main.id
  );

  if (window.UNIVERSE_NETWORK) {
    window.UNIVERSE_NETWORK.destroy();
    window.UNIVERSE_NETWORK = null;
  }

  renderUniverse(visible, firstLevel);
}
