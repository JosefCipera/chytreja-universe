// universe-viewers.js

// jednoduchý markdown → HTML parser
export function convertMarkdownToHtml(md) {
  return marked.parse(md);
}

/**
 * Vrací absolutní URL podle typu souboru.
 * Slouží jak pro Universe, tak pro Mediotéku.
 */
export function resolveMediaPath(path) {

  // Pokud už začíná / → necháme jak je
  if (path.startsWith("/")) return path;

  // Lokální video / audio / obrázky / pdf
  if (path.endsWith(".mp3")) return `/media/audio/${path}`;
  if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg"))
    return `/media/images/${path}`;
  if (path.endsWith(".pdf")) return `/media/pdf/${path}`;
  if (path.endsWith(".md")) return `/clanky/${path}`;

  // fallback
  return path;
}
