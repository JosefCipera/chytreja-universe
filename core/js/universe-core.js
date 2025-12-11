// -------------------------------------------------------------
//  UNIVERSE CORE – hierarchická vizualizace (Slunce → děti → vnoučata)
// -------------------------------------------------------------

import { showPanel } from "./universe-panel.js";

let ALL_NODES = [];
let network = null;

// -------------------------------------------------------------
// Najdi děti daného uzlu
// -------------------------------------------------------------
function getChildren(id) {
  return ALL_NODES.filter(n => n.parent === id);
}

// -------------------------------------------------------------
// Rozmístění uzlů po kruhu
// -------------------------------------------------------------
function placeOnCircle(list, radius, cx, cy) {
  if (!list.length) return;
  const step = (2 * Math.PI) / list.length;

  list.forEach((n, i) => {
    n.x = cx + radius * Math.cos(i * step);
    n.y = cy + radius * Math.sin(i * step);
  });
}

// -------------------------------------------------------------
// Vykreslení: střed + 1. úroveň + 2. úroveň
// -------------------------------------------------------------
export function renderUniverse(centerId) {
  const container = document.getElementById("network");
  if (!container) return;

  const center = ALL_NODES.find(n => n.id === centerId);
  if (!center) return;

  const children = getChildren(centerId);
  const grandchildren = children.flatMap(ch => getChildren(ch.id));

  // Pozice středového uzlu
  const cx = 0, cy = 0;

  center.x = cx;
  center.y = cy;

  placeOnCircle(children, 350, cx, cy);
  placeOnCircle(grandchildren, 650, cx, cy);

  // Hrany
  const edges = [
    ...children.map(ch => ({ from: center.id, to: ch.id, color: "#64748b" })),
    ...grandchildren.map(gn => ({ from: gn.parent, to: gn.id, color: "#64748b" }))
  ];

  // Uzly
  const visibleNodes = [
    {
      id: center.id,
      label: center.label,
      color: center.color,
      shape: "dot",
      size: 40,
      x: center.x,
      y: center.y,
      physics: false
    },
    ...children.map(n => ({
      id: n.id,
      label: n.label,
      color: n.color,
      shape: "dot",
      size: 24,
      x: n.x,
      y: n.y,
      physics: false
    })),
    ...grandchildren.map(n => ({
      id: n.id,
      label: n.label,
      color: n.color,
      shape: "dot",
      size: 18,
      x: n.x,
      y: n.y,
      physics: false
    }))
  ];

  const data = { nodes: visibleNodes, edges };

  const options = {
    physics: false,
    edges: { smooth: false },
    nodes: { font: { color: "#fff", size: 16 } }
  };

  if (network) network.destroy();
  network = new vis.Network(container, data, options);

  // Klik na uzel → nový střed
  network.on("click", params => {
    if (params.nodes.length) {
      const id = params.nodes[0];
      const node = ALL_NODES.find(n => n.id === id);
      if (node) {
        showPanel(node);
        renderUniverse(id);
      }
    } else {
      // Klik mimo → zpět k rodiči
      if (center.parent) {
        renderUniverse(center.parent);
      }
    }
  });
}

// -------------------------------------------------------------
// Uložení modelu
// -------------------------------------------------------------
export function setUniverseModel(nodes) {
  ALL_NODES = nodes;
}
