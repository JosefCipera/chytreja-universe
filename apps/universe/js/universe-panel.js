// -------------------------------------------------------------
// UNIVERSE-PANEL.JS
// Postranní panel pro zobrazení dokumentů, médií a detailů uzlu
// -------------------------------------------------------------

import { openViewer } from "./universe-viewers.js";

// Elementy panelu
const panelEl = document.getElementById("sidePanel");
const titleEl = document.getElementById("nodeTitle");
const defEl = document.getElementById("nodeDef");
const docsEl = document.getElementById("nodeDocs");
const mediaEl = document.getElementById("nodeMedia");
const tasksEl = document.getElementById("nodeTasks");
const closeBtn = document.getElementById("closePanel");

// -------------------------------------------------------------
// RESET PANELU
// -------------------------------------------------------------
function resetPanel() {
  [defEl, docsEl, mediaEl, tasksEl].forEach(el => (el.innerHTML = ""));

  const labInfos = document.querySelectorAll(".lab-info");
  labInfos.forEach(l => l.remove());

  const dashBtn = document.getElementById("openBioDashboard");
  if (dashBtn) dashBtn.remove();
}

// -------------------------------------------------------------
// ZAVŘENÍ PANELU
// -------------------------------------------------------------
export function closePanel() {
  panelEl.classList.remove("visible");
  resetPanel();
}

if (closeBtn) {
  closeBtn.addEventListener("click", closePanel);
}

// Kliknutí mimo panel jej zavře
document.addEventListener("click", e => {
  if (!panelEl.classList.contains("visible")) return;
  if (!panelEl.contains(e.target)) closePanel();
});

// -------------------------------------------------------------
// HLAVNÍ FUNKCE – ZOBRAZENÍ PANELU
// -------------------------------------------------------------
export function showPanel(node) {
  console.log("📌 Otevírám panel:", node.id);

  resetPanel();
  panelEl.classList.add("visible");

  // -------------------------------------------------------------
  // Nadpis
  // -------------------------------------------------------------
  const icon = node.icon || "🧩";

  titleEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:28px">${icon}</span>
      <span style="font-size:22px;font-weight:600;color:#f1f5f9">${node.label}</span>
    </div>
  `;

  // -------------------------------------------------------------
  // Definice
  // -------------------------------------------------------------
  defEl.textContent = node.definition || "";

  // -------------------------------------------------------------
  // Dokumenty (MD, PDF)
  // -------------------------------------------------------------
  if (node.documents) {
    node.documents.forEach(doc => {
      const isMd = doc.url.toLowerCase().endsWith(".md");
      const icon = isMd ? "📝" : "📄";

      const li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.marginBottom = "12px";

      li.innerHTML = `
        <a href="#" style="color:#38bdf8;font-weight:500;">${icon} ${doc.title}</a>
        <br><small style="color:#94a3b8">${doc.summary || ""}</small>
      `;

      li.querySelector("a").onclick = e => {
        e.preventDefault();
        openViewer(doc.url);
      };

      docsEl.appendChild(li);
    });
  }

  // -------------------------------------------------------------
  // Média (video / audio / image)
  // -------------------------------------------------------------
  if (node.media) {
    node.media.forEach(m => {
      const li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.marginBottom = "20px";

      let html = `
        <p style="color:#38bdf8;font-weight:500;margin:0 0 4px 0;">${m.title}</p>
        <small style="color:#94a3b8">${m.summary || ""}</small>
        <br>
      `;

      if (m.type === "video") {
        html += `
          <iframe width="100%" height="220"
                  src="${m.url}"
                  frameborder="0"
                  allowfullscreen
                  style="border-radius:10px;margin-top:8px;">
          </iframe>
        `;
      }

      if (m.type === "audio") {
        html += `
          <audio controls style="width:100%;margin-top:8px;">
            <source src="${m.url}">
          </audio>
        `;
      }

      if (m.type === "image") {
        html += `
          <img src="${m.url}" style="
            display:block;
            margin:12px auto;
            width:100%;
            max-width:180px;
            border-radius:12px;
            box-shadow:0 0 8px rgba(0,0,0,0.35);
          ">
        `;
      }

      li.innerHTML = html;
      mediaEl.appendChild(li);
    });
  }

  // -------------------------------------------------------------
  // Tasks / odkazy
  // -------------------------------------------------------------
  if (node.tasks) {
    node.tasks.forEach(t => {
      const li = document.createElement("li");
      li.style.listStyle = "none";

      li.innerHTML = t.url
        ? `<a href="${t.url}" target="_blank" style="color:#38bdf8;">🔗 ${t.title}</a>`
        : `• ${t.title}`;

      tasksEl.appendChild(li);
    });
  }
}
