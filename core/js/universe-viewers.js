// -------------------------------------------------------------
// VIEWER – bezpečné otevření MD / PDF / IMG pro Longevity
// -------------------------------------------------------------

export function openViewer(url) {
  console.log("📄 openViewer() – původní URL:", url);

  let clean = url.trim();

  // 1) Odstranit prefixy ./ nebo ../
  clean = clean
    .replace(/^\.\/+/g, "")   // "./data/docs/..." → "data/docs/..."
    .replace(/^\.\.\/+/g, "") // "../apps/..." → "apps/..."
    .replace(/^\/+/g, "");    // "/data/..." → "data/..."

  // 2) Pokud není absolutní cesta do longevity → doplníme ji
  if (!clean.startsWith("apps/longevity/")) {
    clean = "apps/longevity/" + clean;
  }

  // 3) Normalizace lomítek
  clean = "/" + clean.replace(/\/{2,}/g, "/");

  console.log("📌 Normalizovaná cesta k souboru:", clean);

  // 4) Cesta na viewer
  const viewerUrl = `/core/ui/viewer.html?file=${encodeURIComponent(clean)}`;

  console.log("➡️ Otevírám viewer:", viewerUrl);
  window.open(viewerUrl, "_blank");
}
