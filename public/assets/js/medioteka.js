//---------------------------------------------------------------------
// ICONY — přesně podle původní verze z tvého obrázku
//---------------------------------------------------------------------
const iconMap = {
  audio: '<i class="fas fa-headphones" style="font-size:32px;color:#8B5CF6;"></i>',
  video: '<i class="fas fa-video" style="font-size:32px;color:#EF4444;"></i>',
  image: '<i class="fas fa-image" style="font-size:32px;color:#6366F1;"></i>',
  pdf: '<i class="fas fa-file-pdf" style="font-size:32px;color:#DC2626;"></i>',
  article: '<i class="fas fa-book" style="font-size:32px;color:#3B82F6;"></i>',
};

//---------------------------------------------------------------------
// NAČTENÍ DAT
//---------------------------------------------------------------------
async function loadData() {
  const response = await fetch("./assets/models/medioteka.json");
  const data = await response.json();
  return data.library || [];
}

//---------------------------------------------------------------------
// VYKRESLENÍ GRIDU
//---------------------------------------------------------------------
function renderMediaGrid(items) {
  const grid = document.getElementById("mediaGrid");
  grid.innerHTML = "";

  if (!items.length) {
    grid.innerHTML = `<p class="medioteka-empty">Nenalezeny žádné výsledky.</p>`;
    return;
  }

  items.forEach(item => {
    const icon = iconMap[item.type] || "";

    const html = `
            <div class="medioteka-card" onclick="openModal('${item.id}')">
                <div class="medioteka-card-icon">${icon}</div>
                <h3 class="medioteka-card-title">${item.title}</h3>
                <p class="medioteka-card-desc">${item.description}</p>
                <span class="medioteka-card-tag">${item.type.toUpperCase()}</span>
            </div>
        `;

    grid.innerHTML += html;
  });
}

//---------------------------------------------------------------------
// VYHLEDÁVÁNÍ (opraveno — hledá v titulku, popisu i tagách)
//---------------------------------------------------------------------
// Normalizace textu (bez diakritiky, malé písmo)
function norm(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function setupSearch(allItems) {
  const input = document.getElementById("searchInput");

  input.addEventListener("input", () => {
    const q = norm(input.value.trim());
    const words = q.split(" ").filter(w => w.length > 0);

    if (!words.length) {
      renderMediaGrid(allItems);
      return;
    }

    const filtered = allItems.filter(item => {
      const haystack = norm(
        item.title + " " +
        item.description + " " +
        (item.tags || []).join(" ")
      );

      // všechny slova musí být obsaženy (AND logika)
      return words.every(w => haystack.includes(w));
    });

    renderMediaGrid(filtered);
  });
}

//---------------------------------------------------------------------
// MODÁLNÍ OKNO
//---------------------------------------------------------------------
function openModal(itemId) {
  loadData().then(items => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById("mediaModal");
    const inner = document.getElementById("modalInner");

    //-------------------------------------------------------------
    // VIDEO
    //-------------------------------------------------------------
    if (item.type === "video") {
      const embed = convertYoutube(item.url);
      inner.innerHTML = `
                <iframe width="100%" height="420" src="${embed}" frameborder="0" allowfullscreen></iframe>
            `;
    }

    //-------------------------------------------------------------
    // AUDIO
    //-------------------------------------------------------------
    else if (item.type === "audio") {
      inner.innerHTML = `
                <h2>${item.title}</h2>
                <audio controls style="width:100%;margin-top:20px;">
                    <source src="${item.url}" type="audio/mpeg">
                </audio>
            `;
    }

    //-------------------------------------------------------------
    // OBRÁZEK
    //-------------------------------------------------------------
    else if (item.type === "image") {
      inner.innerHTML = `
                <img src="${item.url}" style="max-width:100%;border-radius:12px;">
            `;
    }

    //-------------------------------------------------------------
    // PDF
    //-------------------------------------------------------------
    else if (item.type === "pdf") {
      inner.innerHTML = `
                <a href="${item.url}" target="_blank" class="medioteka-pdf-link">
                    Otevřít PDF v novém okně →
                </a>
            `;
    }

    //-------------------------------------------------------------
    // ČLÁNEK (Markdown)
    //-------------------------------------------------------------
    else if (item.type === "article") {
      fetch(item.contentUrl)
        .then(r => r.text())
        .then(md => {
          inner.innerHTML = `<div class="medioteka-article">${marked.parse(md)}</div>`;
        });
    }

    modal.classList.remove("hidden");
  });
}

function closeModal() {
  document.getElementById("mediaModal").classList.add("hidden");
}

document.getElementById("modalClose").addEventListener("click", closeModal);


//---------------------------------------------------------------------
// YouTube embed konverze
//---------------------------------------------------------------------
function convertYoutube(url) {
  try {
    const id = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
}

//---------------------------------------------------------------------
// INIT
//---------------------------------------------------------------------
(async function init() {
  const items = await loadData();
  renderMediaGrid(items);
  setupSearch(items);
})();
