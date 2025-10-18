// === UNIVERSE-CORE.JS ===
// Stabilní verze s podporou podsítí, panelu, hlasu a nově PDF/MD viewerů

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

// 🌌 Vykreslení hlavní nebo podsítě
export function renderUniverse(DATA, subset = null) {
  const nodes = [];
  const edges = [];
  const seen = new Set();
  const source = subset || DATA;

  // 🔹 Vytvoř uzly
  source.forEach(it => {
    const isMain = it.id === "dlouhovekost";
    nodes.push(makeNode(it, isMain));

    // 🔹 Vazby (jednostranné)
    (it.related || []).forEach(r => {
      const key = [it.id, r].sort().join("::");
      if (!seen.has(key)) {
        seen.add(key);
        edges.push(makeEdge(it.id, r));
      }
    });
  });

  const nodesDS = new vis.DataSet(nodes);
  const edgesDS = new vis.DataSet(edges);

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

  network = new vis.Network(el.network, { nodes: nodesDS, edges: edgesDS }, options);

  // 🖱️ Klik – otevře panel
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
  return {
    id: it.id,
    label: it.label,
    color: {
      background: it.color || "#1e293b",
      border: it.color || "#64748b",
      highlight: {
        background: it.color ? lighten(it.color, 0.25) : "#334155",
        border: it.color || "#64748b"
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

function openSubUniverse(DATA, centerNode) {
  let subNodes = [];
  const subEdges = [];
  const seen = new Set();

  if (centerNode.subnodes && centerNode.subnodes.length > 0) {
    subNodes = [centerNode, ...centerNode.subnodes];
    centerNode.subnodes.forEach(sub => {
      const keyParent = [centerNode.id, sub.id].sort().join("::");
      if (!seen.has(keyParent)) {
        seen.add(keyParent);
        subEdges.push(makeEdge(centerNode.id, sub.id));
      }
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
    aiSpeak(`Uzel ${centerNode.label} nemá žádné poduzly.`);
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
    aiSpeak(`Vstupuji do podvesmíru ${centerNode.label}.`);
    setTimeout(() => el.network.classList.remove("fade-blur-in"), 900);
  }, 900);
}

function smoothReturnToUniverse(DATA) {
  playWhoosh();
  el.network.classList.add("fade-blur-out");
  setTimeout(() => {
    renderUniverse(DATA);
    el.network.classList.remove("fade-blur-out");
    el.network.classList.add("fade-blur-in");
    aiSpeak("Vracíme se zpět do hlavního vesmíru.");
    setTimeout(() => el.network.classList.remove("fade-blur-in"), 900);
  }, 900);
}

function closePanel() {
  el.side.classList.remove("visible");
}

function playWhoosh() {
  const audio = new Audio("./assets/sounds/whoosh.mp3");
  audio.volume = 0.25;
  audio.play().catch(() => { });
}

// === PANEL ===
function showPanel(node) {
  let iconHTML = "";
  if (node.icon) {
    iconHTML = `<i class="${node.icon}" style="color:${node.color || '#fff'};text-shadow:0 0 4px ${node.color || '#fff'}, 0 0 8px ${node.color || '#fff'}55;margin-right:6px;"></i>`;
  }
  el.title.innerHTML = `${iconHTML}${node.label}`;
  el.def.textContent = node.definition || "";

  el.docs.innerHTML = "";
  el.media.innerHTML = "";
  el.tasks.innerHTML = "";

  // 📘 Články (PDF / MD / externí) — plně funkční varianta
  (node.articles || []).forEach(a => {
    const li = document.createElement("li");

    const aEl = document.createElement("a");
    aEl.className = "doc-link";
    aEl.href = "#";

    const url = (a.url || "").toLowerCase();
    const isPdf = url.endsWith(".pdf");
    const isMd = url.endsWith(".md");
    const icon = isPdf ? "📘" : isMd ? "📄" : "🔗";

    aEl.textContent = `${icon} ${a.title}`;

    aEl.addEventListener("click", (e) => {
      e.preventDefault();
      if (isPdf) openPdfViewer(a.url);
      else if (isMd) openMdViewer(a.url);
      else window.open(a.url, "_blank");
    });

    li.appendChild(aEl);

    if (a.summary) {
      const p = document.createElement("p");
      p.className = "article-summary";
      p.textContent = a.summary;
      li.appendChild(p);
    }

    el.docs.appendChild(li);
  });

  // 🎬 Média
  (node.media || []).forEach(m => {
    const li = document.createElement("li");
    const url = m.url || "";
    if (/youtube\.com\/embed/.test(url)) {
      li.innerHTML = `🎥 ${m.title}<br><div class="media-glass"><iframe width="100%" height="230" src="${url}" frameborder="0" allowfullscreen></iframe></div>`;
    } else if (/(\.mp4|\.webm)$/i.test(url)) {
      li.innerHTML = `🎥 ${m.title}<br><div class="media-glass"><video controls playsinline preload="metadata"><source src="${url}" type="video/mp4"></video></div>`;
    } else if (/\.mp3$/i.test(url)) {
      li.innerHTML = `🎧 ${m.title}<br><div class="media-glass"><audio controls><source src="${url}" type="audio/mpeg"></audio></div>`;
    } else if (/(\.jpg|\.jpeg|\.png|\.webp)$/i.test(url)) {
      li.innerHTML = `🖼️ ${m.title}<br><div class="media-glass"><img src="${url}" alt="${m.title}"></div>`;
    } else {
      li.textContent = m.title;
    }
    el.media.appendChild(li);
  });

  // ✅ Úlohy
  (node.tasks || []).forEach(t => {
    const li = document.createElement("li");
    if (t.url)
      li.innerHTML = `<a href="${t.url}" target="_blank" class="doc-link">${t.title}</a>`;
    else li.textContent = t.title;
    el.tasks.appendChild(li);
  });

  el.side.classList.add("visible");
  aiSpeak(`Otevírám uzel ${node.label}.`);
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

// === JEDNODUCHÝ VIEWER PRO PDF A MARKDOWN ===

// Otevření PDF v prohlížeči (nová karta)
function openPdfViewer(url) {
  window.open(url, "_blank");
}

// Otevření Markdownu – vykreslíme ho přímo v nové stránce
function openMdViewer(url) {
  fetch(url)
    .then(r => r.text())
    .then(md => {
      const html = `
        <html lang="cs">
        <head>
          <meta charset="UTF-8">
          <title>Dokument</title>
          <style>
            body {
              background: #0f172a;
              color: #e2e8f0;
              font-family: Inter, sans-serif;
              line-height: 1.6;
              padding: 2rem;
              max-width: 800px;
              margin: auto;
            }
            h1, h2, h3 { color: #93c5fd; }
            a { color: #60a5fa; text-decoration: none; }
            a:hover { text-decoration: underline; }
            pre { background: #1e293b; padding: 10px; border-radius: 8px; overflow-x: auto; }
            code { color: #facc15; }
          </style>
        </head>
        <body>
          ${convertMarkdownToHtml(md)}
        </body>
        </html>`;
      const newWindow = window.open();
      newWindow.document.write(html);
      newWindow.document.close();
    })
    .catch(err => console.error("❌ Nelze načíst MD:", err));
}

// Základní převod Markdown → HTML (jednoduchý parser)
function convertMarkdownToHtml(md) {
  return md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*?)\*/gim, "<i>$1</i>")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
    .replace(/\n$/gim, "<br>");
}


function closeViewers() {
  document.querySelectorAll(".md-viewer, .pdf-viewer").forEach(v => v.remove());
}
