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
}

function smoothReturnToUniverse(DATA) {
  playWhoosh();
  el.network.classList.add("fade-blur-out");
  setTimeout(() => {
    renderUniverse(DATA);
    el.network.classList.remove("fade-blur-out");
    el.network.classList.add("fade-blur-in");
    //aiSpeak("Vracíme se zpět do hlavního vesmíru.");
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
  let iconHTML = "";
  if (node.icon) {
    iconHTML = `<i class="${node.icon}" style="color:${node.color || '#fff'};text-shadow:0 0 4px ${node.color || '#fff'}, 0 0 8px ${node.color || '#fff'}55;margin-right:6px;"></i>`;
  }
  el.title.innerHTML = `${iconHTML}${node.label}`;
  el.def.textContent = node.definition || "";

  el.docs.innerHTML = "";
  el.media.innerHTML = "";
  el.tasks.innerHTML = "";

  // 📘 Dokumenty
  el.docs.innerHTML = "";
  (node.articles || []).forEach(a => {
    const li = document.createElement("li");
    const aEl = document.createElement("a");
    aEl.className = "doc-link";
    aEl.href = "#";

    const url = (a.url || "").toLowerCase();
    const isPdf = url.endsWith(".pdf");
    const isMd = url.endsWith(".md");
    const icon = isPdf ? "📘" : isMd ? "📄" : "🔗";

    aEl.textContent = `${icon} ${a.title || url.split("/").pop()}`;
    aEl.addEventListener("click", e => {
      e.preventDefault();
      if (isPdf) openPdfViewer(a.url);
      else if (isMd) openMdViewer(a.url); // 🟢 pouze URL
      else window.open(a.url, "_blank");
    });

    li.appendChild(aEl);
    el.docs.appendChild(li);
  });

  // 🎬 Média (zjednodušená stabilní verze)
  (node.media || []).forEach(m => {
    const li = document.createElement("li");
    const url = m.url || "";
    const title = m.title || "Médium";

    if (/youtube\.com\/embed/.test(url)) {
      li.innerHTML = `
      🎥 ${title}<br>
      <div class="media-glass">
        <iframe width="100%" height="230" src="${url}" frameborder="0" allowfullscreen></iframe>
      </div>`;
    } else if (/\.mp3$/i.test(url)) {
      li.innerHTML = `
      🎧 ${title}<br>
      <div class="media-glass">
        <audio controls style="width:100%;">
          <source src="${url}" type="audio/mpeg">
        </audio>
      </div>`;
    } else {
      li.innerHTML = `🔗 <a href="${url}" target="_blank">${title}</a>`;
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
  // aiSpeak(`Otevírám uzel ${node.label}.`);
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
  fetch(url)
    .then(r => r.text())
    .then(md => {
      const html = `
        <html lang="cs">
        <head>
          <meta charset="UTF-8">
          <title>${url.split("/").pop()}</title>
          <style>
            body {
              background: #0f172a;
              color: #cbd5e1;
              font-family: 'Inter', sans-serif;
              line-height: 1.7;
              padding: 2rem;
              max-width: 840px;
              margin: auto;
              font-size: 1.05rem;
            }
            h1, h2, h3 { color: #93c5fd; }
            a { color: #7dd3fc; text-decoration: none; }
            a:hover { text-decoration: underline; }
            pre {
              background: #1e293b;
              padding: 10px 14px;
              border-radius: 10px;
              overflow-x: auto;
            }
            code { color: #facc15; }
          </style>
        </head>
        <body>
          <button onclick="window.close()" style="float:right;background:#1e293b;color:#93c5fd;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;">✖ Zavřít</button>
          ${convertMarkdownToHtml(md)}
        </body>
        </html>`;
      const newWindow = window.open();
      newWindow.document.write(html);
      newWindow.document.close();
    })
    .catch(err => console.error("❌ Nelze načíst MD:", err));
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
