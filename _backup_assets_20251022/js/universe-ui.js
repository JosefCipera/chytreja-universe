// === UNIVERSE-UI.JS ===
// Správa panelu a zobrazení obsahu uzlu

import { aiSpeak } from "./universe-voice.js";

const el = {
  side: document.getElementById("sidePanel"),
  title: document.getElementById("nodeTitle"),
  def: document.getElementById("nodeDef"),
  docs: document.getElementById("nodeDocs"),
  media: document.getElementById("nodeMedia"),
  tasks: document.getElementById("nodeTasks")
};

// 📘 Zobrazí panel s informacemi o uzlu
export function showPanel(node) {
  let iconHTML = "";
  if (node.icon) {
    iconHTML = `<i class="${node.icon}" style="color:${node.color || '#fff'};text-shadow:0 0 4px ${node.color || '#fff'}, 0 0 8px ${node.color || '#fff'}55;margin-right:6px;"></i>`;
  }

  el.title.innerHTML = `${iconHTML}${node.label}`;
  el.def.textContent = node.definition || "";

  el.docs.innerHTML = "";
  el.media.innerHTML = "";
  el.tasks.innerHTML = "";

  (node.articles || []).forEach(a => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${a.url}" target="_blank" class="doc-link">${a.title}</a>`;
    el.docs.appendChild(li);
  });

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

// 🔻 Zavření panelu
export function closePanel() {
  el.side.classList.remove("visible");
  aiSpeak("Panel uzavřen.");
}
// === UNIVERSE-UI.JS ===
// Pomocná inicializace uživatelského rozhraní (zatím jednoduchá)

export function setupUI(aiSpeak) {
  console.log("🧠 UI inicializováno");
  // Tady můžeš později přidat další logiku
  // např. zpracování kláves, tlačítek, animací apod.

  // Hlasový uvítací efekt (volitelné)
  if (aiSpeak) {
    aiSpeak("Model vesmíru Dlouhověkost je připraven.");
  }
}
