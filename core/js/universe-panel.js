// -------------------------------------------------------------
//  UNIVERSE PANEL – moderní panel s embed dokumenty a médii
// -------------------------------------------------------------

import { openViewer } from "./universe-viewers.js";

let panelEl, titleEl, defEl, docsEl, mediaEl, tasksEl, closeBtn;

export function initUniversePanel() {
  panelEl = document.getElementById("sidePanel");
  titleEl = document.getElementById("nodeTitle");
  defEl = document.getElementById("nodeDef");
  docsEl = document.getElementById("nodeDocs");
  mediaEl = document.getElementById("nodeMedia");
  tasksEl = document.getElementById("nodeTasks");
  closeBtn = document.getElementById("closePanel");

  if (closeBtn) closeBtn.addEventListener("click", closePanel);
}

// -------------------------------------------------------------
// Otevření panelu
// -------------------------------------------------------------
export function showPanel(node) {
  openPanel(node);
}

export function openPanel(node) {
  if (!panelEl) return;

  panelEl.classList.add("visible");

  titleEl.textContent = node.label;
  defEl.textContent = node.definition || "";

  // ---------------------- Dokumenty ----------------------
  docsEl.innerHTML = "";

  (node.documents || []).forEach(doc => {
    const block = document.createElement("div");
    block.className = "panel-doc";

    const title = document.createElement("div");
    title.innerHTML = `📘 <strong>${doc.title}</strong>`;
    block.appendChild(title);

    if (doc.url.endsWith(".pdf") || doc.url.endsWith(".md")) {
      const link = document.createElement("a");
      link.href = "#";
      link.className = "doc-link";
      link.textContent = "Otevřít dokument →";
      link.onclick = () => openViewer(doc.url);
      block.appendChild(link);
    }

    docsEl.appendChild(block);
  });

  // ---------------------- Média ----------------------
  mediaEl.innerHTML = "";

  (node.media || []).forEach(m => {
    const block = document.createElement("div");
    block.className = "panel-media";

    const icon =
      m.type === "video" ? "🎬" :
        m.type === "audio" ? "🎧" :
          m.type === "image" ? "🖼️" :
            "📎";

    const title = document.createElement("div");
    title.innerHTML = `${icon} <strong>${m.title}</strong>`;
    block.appendChild(title);

    block.appendChild(embedMedia(m.url, m.type));
    mediaEl.appendChild(block);
  });
}

// -------------------------------------------------------------
// Embed helper
// -------------------------------------------------------------
function embedMedia(url, type) {
  if (type === "video" || url.includes("youtube.com")) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.width = "100%";
    iframe.height = "220";
    iframe.style.border = "0";
    iframe.allowFullscreen = true;
    return iframe;
  }

  if (type === "audio") {
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    audio.style.width = "100%";
    return audio;
  }

  if (type === "image") {
    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "10px";
    img.style.margin = "12px 0";
    return img;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.textContent = url;
  return link;
}

// -------------------------------------------------------------
export function closePanel() {
  panelEl.classList.remove("visible");
}
