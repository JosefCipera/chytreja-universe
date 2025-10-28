// === UNIVERSE-CORE.JS ===
// Stabilní verze s podporou podsítí, panelu, hlasu a PDF/MD viewerů

const el = {
  network: document.getElementById("network"),
  side: document.getElementById("sidePanel"),
  title: document.getElementById("nodeTitle"),
  def: document.getElementById("nodeDef"),
  docs: document.getElementById("nodeDocs"),
  media: document.getElementById("nodeMedia"),
  tasks: document.getElementById("nodeTasks"),
  close: document.getElementById("closePanel")
};

let network;
let isSubUniverse = false;
let currentCenter = null;

// === Historie podsítí a poslední zobrazené uzly ===
const universeHistory = [];
let lastRenderedNodes = [];


// 🌌 Vykreslení hlavní nebo podsítě
export function renderUniverse(DATA, subset = null) {
  const nodes = [];
  const edges = [];
  const seen = new Set();
  const source = subset || DATA;

  // 🧼 znič předchozí síť, ať se korektně překreslí
  if (network && typeof network.destroy === "function") {
    network.destroy();
  }

  // 🧠 dynamický hlavní uzel (podpora pro dlouhověkost i TOC)
  const preferredRoot =
    source.find(n => n.id === "dlouhovekost") ||
    source.find(n => n.id === "toc") ||
    source[0];
  const mainId = preferredRoot?.id;

  // 🔹 Vytvoř uzly + hrany
  source.forEach(it => {
    const isMain = it.id === mainId;
    nodes.push(makeNode(it, isMain));

    (it.related || []).forEach(r => {
      const key = [it.id, r].sort().join("::");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push(makeEdge(it.id, r));
      }
    });
  });

  // 🔸 DataSety
  const nodesDS = new vis.DataSet(nodes);
  const edgesDS = new vis.DataSet(edges);

  // ⚙️ Nastavení vzhledu a fyziky
  const options = {
    nodes: { shadow: true },
    edges: {
      smooth: { enabled: true, type: "dynamic", roundness: 0.55 },
      dashes: true,
      width: 1,
      color: { color: "#9ca3af" }
    },
    physics: {
      barnesHut: {
        gravitationalConstant: -20000,
        springLength: 200,
        springConstant: 0.04
      }
    },
    interaction: { hover: false }
  };

  // 🌌 Vykreslení nové sítě
  network = new vis.Network(el.network, { nodes: nodesDS, edges: edgesDS }, options);

  // ✨ Vycentrování s animací
  setTimeout(() => network.fit({ animation: true }), 300);

  // 🖱️ Klik – otevře panel nebo návrat
  let clickTimer = null;
  network.on("click", params => {
    if (!params.nodes.length) {
      el.side.classList.remove("visible");
      if (isSubUniverse) {
        smoothReturnToUniverse(DATA);
        isSubUniverse = false;
        currentCenter = null;
      }
      return;
    }

    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      const id = params.nodes[0];
      const node = findNodeById(DATA, id);
      if (node) showPanel(node);
    }, 250);
  });

  // 👆 Dvojklik = vstup do podsítě
  network.on("doubleClick", params => {
    clearTimeout(clickTimer);
    if (!params.nodes.length) return;
    const id = params.nodes[0];
    const node = findNodeById(DATA, id);
    if (!node) return;
    openSubUniverse(DATA, node);
  });

  el.close.onclick = () => closePanel();
}


// === Pomocné funkce ===

function makeNode(it, isMain) {
  const baseColor =
    (typeof it.color === "string"
      ? it.color
      : (it.color && it.color.background)) || "#1e293b";

  const borderColor =
    (typeof it.color === "object" && it.color && it.color.border)
      ? it.color.border
      : baseColor;

  return {
    id: it.id,
    label: it.label,
    color: {
      background: baseColor,
      border: borderColor,
      highlight: {
        background: lighten(baseColor, 0.25),
        border: borderColor
      }
    },
    shape: "dot",
    size: isMain ? 42 : 30,
    font: { color: "#fff", size: isMain ? 20 : 17 },
    borderWidth: 2,
    shadow: true
  };
}

function makeEdge(from, to) {
  const direction = Math.random() > 0.5 ? "curvedCW" : "curvedCCW";
  const roundness = 0.45 + Math.random() * 0.2;
  return {
    id: [from, to].sort().join("::"),
    from,
    to,
    color: { color: "#9ca3af" },
    dashes: true,
    width: 1,
    smooth: { enabled: true, type: direction, roundness }
  };
}

function findNodeById(DATA, id) {
  for (const n of DATA) {
    if (n.id === id) return n;
    if (n.subnodes) {
      const sub = n.subnodes.find(s => s.id === id);
      if (sub) return sub;
    }
  }
  return null;
}

// === Podsíť ===
function openSubUniverse(DATA, centerNode) {
  let subNodes = [];
  const subEdges = [];
  const seen = new Set();

  // 🔹 Ulož aktuální stav, než přejdeme do podsítě
  if (currentCenter) {
    universeHistory.push({
      centerId: currentCenter,
      subNodes: lastRenderedNodes || []
    });
  }

  if (centerNode.subnodes && centerNode.subnodes.length > 0) {
    subNodes = [centerNode, ...centerNode.subnodes];

    centerNode.subnodes.forEach(sub => {
      const keyParent = [centerNode.id, sub.id].sort().join("::");
      if (!seen.has(keyParent)) {
        seen.add(keyParent);
        subEdges.push(makeEdge(centerNode.id, sub.id));
      }

      (sub.related || []).forEach(r => {
        const keySub = [sub.id, r].sort().join("::");
        if (!seen.has(keySub)) {
          seen.add(keySub);
          subEdges.push(makeEdge(sub.id, r));
        }
      });
    });
  } else if (centerNode.related && centerNode.related.length > 0) {
    const relatedIds = new Set([centerNode.id, ...centerNode.related]);
    subNodes = DATA.filter(n => relatedIds.has(n.id));
    (centerNode.related || []).forEach(r => {
      const key = [centerNode.id, r].sort().join("::");
      if (!seen.has(key)) {
        seen.add(key);
        subEdges.push(makeEdge(centerNode.id, r));
      }
    });
  } else {
    // aiSpeak(`Uzel ${centerNode.label} nemá žádné poduzly.`);
    return;
  }

  playWhoosh();
  el.network.classList.add("fade-blur-out");

  setTimeout(() => {
    renderUniverse(DATA, subNodes);
    el.network.classList.remove("fade-blur-out");
    el.network.classList.add("fade-blur-in");
    isSubUniverse = true;
    currentCenter = centerNode.id;

    const nodes = network.body.data.nodes;
    const center = nodes.get(centerNode.id);
    if (center) {
      center.size = 38; // 💫 větší uzel
      center.font = { color: "#fff", size: 19 };
      nodes.update(center);
    }

    // aiSpeak(`Vstupuji do podvesmíru ${centerNode.label}.`);
    setTimeout(() => el.network.classList.remove("fade-blur-in"), 900);
  }, 900);

  // 🪐 Uložit poslední zobrazené uzly
  lastRenderedNodes = [...subNodes];

}

function smoothReturnToUniverse(DATA) {
  playWhoosh();
  el.network.classList.add("fade-blur-out");

  setTimeout(() => {
    // 🧭 Návrat o jednu úroveň zpět, pokud existuje historie
    if (universeHistory.length > 0) {
      const prevState = universeHistory.pop();

      if (prevState && prevState.subNodes && prevState.subNodes.length > 0) {
        // 🔹 Vracíme se o jednu úroveň výš
        renderUniverse(DATA, prevState.subNodes);
        currentCenter = prevState.centerId;
        isSubUniverse = true;
      } else {
        // 🔹 Vracíme se až na úplný začátek (hlavní uzel + jeho přímé potomky)
        if (window.MAIN_UNIVERSE_DATA) {
          const mainNode = window.MAIN_UNIVERSE_DATA.find(n => !n.parent);
          if (mainNode) {
            const firstLevel = window.MAIN_UNIVERSE_DATA.filter(
              n => n.id === mainNode.id || n.parent === mainNode.id
            );
            renderUniverse(window.MAIN_UNIVERSE_DATA, firstLevel);
          } else {
            renderUniverse(window.MAIN_UNIVERSE_DATA);
          }
        }
        currentCenter = null;
        isSubUniverse = false;
        universeHistory.length = 0; // reset historie
      }

    } else {
      // 🔹 Není historie → rovnou hlavní úroveň (stejná logika jako výše)
      if (window.MAIN_UNIVERSE_DATA) {
        const mainNode = window.MAIN_UNIVERSE_DATA.find(n => !n.parent);
        if (mainNode) {
          const firstLevel = window.MAIN_UNIVERSE_DATA.filter(
            n => n.id === mainNode.id || n.parent === mainNode.id
          );
          renderUniverse(window.MAIN_UNIVERSE_DATA, firstLevel);
        } else {
          renderUniverse(window.MAIN_UNIVERSE_DATA);
        }
      }

      currentCenter = null;
      isSubUniverse = false;
    }

    // ✨ Animace návratu
    el.network.classList.remove("fade-blur-out");
    el.network.classList.add("fade-blur-in");
    setTimeout(() => el.network.classList.remove("fade-blur-in"), 900);
  }, 900);
}

function closePanel() {
  el.side.classList.remove("visible");
}

function playWhoosh() {
  const audio = new Audio("./assets/media/whoosh.mp3");
  audio.volume = 0.25;
  audio.play().catch(() => { });
}

// === PANEL ===
function showPanel(node) {
  const panel = document.getElementById("sidePanel");
  const title = document.getElementById("nodeTitle");
  const def = document.getElementById("nodeDef");
  const docs = document.getElementById("nodeDocs");
  const media = document.getElementById("nodeMedia");
  const tasks = document.getElementById("nodeTasks");

  if (!panel) return;

  // 🪐 Titulek
  if (node.icon) {
    title.innerHTML = `
      <i class="${node.icon}" 
         style="color:${node.color || '#93C5FD'};
                filter:drop-shadow(0 0 4px ${(node.color || '#93C5FD')}55);
                font-size:1.25em;margin-right:8px;">
      </i>${node.label || "—"}
    `;
  } else title.textContent = node.label || "—";

  // 📘 Definice
  def.textContent = node.definition || "";

  // 🧩 Vyčištění sekcí
  [docs, media, tasks].forEach(el => (el.innerHTML = ""));

  // === 📘 Edukativní text pro biomarkery ===
  if (node.id === "biomarkery") {
    const interpret = document.createElement("div");
    interpret.className = "lab-info";
    interpret.innerHTML = `
      <h4 style="margin-top:10px;color:#93c5fd;">Jak interpretovat laboratorní výsledky</h4>
      <p style="font-size:0.9em;line-height:1.5;color:#cbd5e1;">
        Laboratorní hodnoty ukazují okamžitý stav těla – nejsou diagnóza, ale signál.<br>
        <b>Zelená</b> značí rovnováhu, <b>oranžová</b> přetížení nebo adaptaci, 
        a <b>červená</b> upozorňuje na nutnost změny či konzultace.<br>
        Sleduj <em>trend</em> – kam se hodnota pohybuje v čase – to je skutečný ukazatel zdraví.
      </p>
    `;
    def.insertAdjacentElement("afterend", interpret);
  }

  // === 📊 Zobrazení biometrických údajů s limitem + mini-grafem ===
  if (node.value !== undefined && node.unit) {
    if (!window.bioCards) window.bioCards = new Map();

    // kontrola duplicity
    if (window.bioCards.has(node.id)) return;
    // limit 5
    if (window.bioCards.size >= 5) return;

    const container = document.createElement("div");
    container.className = "metric-card";
    container.dataset.id = node.id;

    // --- výpočet poměru ---
    const rangeParts = node.range ? node.range.split(/[-–]/).map(x => parseFloat(x)) : null;
    const [min, max] = rangeParts || [null, null];
    const value = parseFloat(node.value);
    let ratio = 0.5;
    if (min !== null && max !== null && !isNaN(value)) {
      ratio = Math.min(1, Math.max(0, (value - min) / (max - min)));
    }

    // --- vzhled podle stavu ---
    const status = node.status || "neuvedeno";
    let icon = "⚪", bg = "#334155";
    if (status.includes("v normě")) { icon = "✅"; bg = "#14532d"; }
    else if (status.includes("nad")) { icon = "⚠️"; bg = "#78350f"; }
    else if (status.includes("pod")) { icon = "🔻"; bg = "#1e3a8a"; }

    // --- HTML ---
    container.innerHTML = `
      <div class="metric-header" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:1.3em;">${icon}</span>
        <b>${node.label}</b>
      </div>
      <div><b>Hodnota:</b> ${node.value} ${node.unit}</div>
      <div><b>Rozmezí:</b> ${node.range || "—"}</div>
      <div><b>Stav:</b> <span style="color:${node.color || "#fff"}">${status}</span></div>
      <div class="metric-bar" style="background:#475569;border-radius:6px;height:10px;width:100%;overflow:hidden;margin-top:6px;position:relative;">
        <div style="position:absolute;left:0;top:0;height:100%;width:${(ratio * 100).toFixed(1)}%;background:${node.color || "#22c55e"};transition:width 0.6s ease;"></div>
      </div>
      <canvas class="trend-canvas" width="200" height="40" style="margin-top:8px;"></canvas>
    `;

    container.style.background = bg;
    container.style.color = "#f1f5f9";
    container.style.padding = "10px 14px";
    container.style.borderRadius = "12px";
    container.style.marginTop = "10px";
    container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

    // --- Mini trend graf ---
    const canvas = container.querySelector(".trend-canvas");
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      const values = node.history?.map(h => parseFloat(h.value)) ||
        [node.value, node.value * 0.95, node.value * 1.05, node.value];
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = node.color || "#22c55e";
      values.forEach((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - (v / Math.max(...values)) * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      const lastX = w - 4;
      const lastY = h - (values.at(-1) / Math.max(...values)) * h;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    window.bioCards.set(node.id, container);
    def.insertAdjacentElement("afterend", container);
  }

  // === 🧬 Tlačítko pro otevření Mini Dashboardu ===
  const existingBtn = document.getElementById("openBioDashboard");
  if (existingBtn) existingBtn.remove();
  if (node.id === "biomarkery" || node.id === "zdravi") {
    const btn = document.createElement("button");
    btn.id = "openBioDashboard";
    btn.textContent = "🧬 Zobraz přehled biomarkerů";
    btn.style.cssText = `
      display:block;width:100%;margin-top:14px;padding:10px 14px;
      font-size:1rem;background:#3b82f6;color:#fff;border:none;
      border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.3s;
    `;
    btn.onmouseenter = () => (btn.style.background = "#2563eb");
    btn.onmouseleave = () => (btn.style.background = "#3b82f6");
    btn.onclick = () => window.open("./assets/models/dlouhovekost/minidash-zdravi.html", "_blank");
    def.insertAdjacentElement("afterend", btn);
  }

  // === Zobraz panel ===
  panel.classList.add("visible");

  // === Reset helpera ===
  const helper = document.getElementById("aiHelper");
  if (helper) {
    helper.classList.remove("expanded");
    helper.classList.add("mini");
  }

  // Uložit aktuální uzel
  window.currentNode = node;
}



// === HLAS ===
function aiSpeak(text) {
  if (!window.speechSynthesis) return;
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "cs-CZ";
  msg.rate = 1.0;
  msg.pitch = 1.1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

function lighten(hex, percent) {
  if (typeof hex !== "string") return "#64748b";
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

// === VIEWERY ===
function openPdfViewer(url) {
  window.open(url, "_blank");
}

function openMdViewer(url) {
  // Otevři novou stránku s parametrem souboru
  const viewerUrl = `./viewer.html?file=${encodeURIComponent(url)}`;
  window.open(viewerUrl, "_blank");
}

function convertMarkdownToHtml(md) {
  // 🧹 Ořízni zbytečné mezery
  const cleaned = md.trim();

  // 🧠 Nahraď markdown syntaxi za HTML (včetně prvního nadpisu)
  return cleaned
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*?)\*/gim, "<i>$1</i>")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/\n\s*\n/gim, "<br><br>"); // nový odstavec
}

function closeViewers() {
  document.querySelectorAll(".md-viewer, .pdf-viewer").forEach(v => v.remove());
}

// === Mini-Helper logika ===
const miniHelper = document.getElementById("miniHelper");
const helperChat = document.getElementById("helperChat");
const helperPrompt = document.getElementById("helperPrompt");
const helperExpand = document.getElementById("helperExpand");
const helperSend = document.getElementById("helperSend");
const helperInput = document.getElementById("helperInput");
const helperMessages = document.getElementById("helperMessages");

if (miniHelper) {
  const openHelper = () => {
    miniHelper.style.display = "none";
    helperChat.classList.remove("hidden");
    helperInput.focus();
  };
  helperExpand.addEventListener("click", openHelper);
  helperPrompt.addEventListener("focus", openHelper);
}

if (helperSend) {
  helperSend.addEventListener("click", () => {
    const msg = helperInput.value.trim();
    if (!msg) return;
    addHelperMessage("user", msg);
    helperInput.value = "";

    // 💬 Zatím jednoduchá odpověď (mock)
    setTimeout(() => {
      addHelperMessage("ai", `Chytré Já přemýšlí o: "${msg}"`);
    }, 600);
  });
}

function addHelperMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `msg ${sender}`;
  div.textContent = text;
  helperMessages.appendChild(div);
  helperMessages.scrollTop = helperMessages.scrollHeight;
}
