// -------------------------------------------------------------
//  Otevření MD / PDF / obrázků přes viewer
// -------------------------------------------------------------
import { openViewer } from "./universe-viewers.js";

export function openMdViewer(url) {
  openViewer(url);
}

export function openPdfViewer(url) {
  openViewer(url);
}

export function openImageViewer(url) {
  openViewer(url);
}

// -------------------------------------------------------------
//  NORMALIZACE URL → jednoduchá verze
// -------------------------------------------------------------
export function normalizeUrl(url) {
  return url
    .replace(/^\.\//, "/")     // ./data/... → /data/...
    .replace(/^\.\.\//, "/")   // ../apps/... → /apps/...
    .replace(/\/\/+/g, "/");   // // → /
}

// -------------------------------------------------------------
//  Otevření dokumentu z panelu
// -------------------------------------------------------------
export function openDocument(url) {
  const clean = normalizeUrl(url);
  openViewer(clean);
}
