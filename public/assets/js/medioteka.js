// -------------------------------------------------------------
// Ikony
// -------------------------------------------------------------
const iconMap = {
  audio: '<i class="fas fa-headphones" style="font-size:32px;color:#8B5CF6;"></i>',
  video: '<i class="fas fa-video" style="font-size:32px;color:#EF4444;"></i>',
  image: '<i class="fas fa-image" style="font-size:32px;color:#6366F1;"></i>',
  pdf: '<i class="fas fa-file-pdf" style="font-size:32px;color:#DC2626;"></i>',
  article: '<i class="fas fa-book" style="font-size:32px;color:#3B82F6;"></i>',
};

// -------------------------------------------------------------
// DATA — NAČTE SE JEN INDEX.JSON
// -------------------------------------------------------------
async function loadData() {
  const response = await fetch("./data/index.json");
  const data = await response.json();
  return data.library || [];
}

// -------------------------------------------------------------
// GRID
// -------------------------------------------------------------
function renderMediaGrid(items) {
  const grid = document.getElementById("mediaGrid");
  grid.innerHTML = "";

  items.forEach(item => {
    const icon = iconMap[item.type] || "";

    grid.innerHTML += `
      <div class="medioteka-card" onclick="openItem('${item.id}')">
        <div class="medioteka-card-icon">${icon}</div>
        <h3 class="medioteka-card-title">${item.title}</h3>
        <p class="medioteka-card-desc">${item.description}</p>
        <span class="medioteka-card-tag">${item.type.toUpperCase()}</span>
      </div>
    `;
  });
}

// -------------------------------------------------------------
// NORMALIZACE
// -------------------------------------------------------------
function norm(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// -------------------------------------------------------------
// VYHLEDÁVÁNÍ
// -------------------------------------------------------------
function setupSearch(allItems) {
  const input = document.getElementById("searchInput");

  input.addEventListener("input", () => {
    const q = norm(input.value.trim());
    const words = q.split(" ").filter(w => w.length > 0);

    if (!words.length) return renderMediaGrid(allItems);

    const result = allItems.filter(item => {
      const hay = norm(
        item.title + " " +
        item.description + " " +
        (item.tags || []).join(" ")
      );
      return words.every(w => hay.includes(w));
    });

    renderMediaGrid(result);
  });
}

// -------------------------------------------------------------
// VIEWER — JEN VIEWER, ŽÁDNÝ MODÁL
// -------------------------------------------------------------
function openItem(id) {
  loadData().then(items => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    let file = item.type === "article" ? item.contentUrl : item.url;

    // MUST BE RELATIVE PATH
    window.open(
      `/public/viewer.html?type=${item.type}&file=/${encodeURIComponent(file)}`,
      "_blank"
    );
  });
}

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
(async function init() {
  const items = await loadData();
  renderMediaGrid(items);
  setupSearch(items);
})();
