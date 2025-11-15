// === UNIVERSE-VIEWERS.JS ===
// Centrální viewer dokumentů pro celý vesmír

console.log("📁 universe-viewers.js načten");

// Otevře viewer podle typu souboru
export function openViewer(url) {
  const clean = url.replace("../public/", "../");
  const ext = clean.toLowerCase();

  let type = "html";

  if (ext.endsWith(".pdf")) type = "pdf";
  if (ext.endsWith(".md")) type = "md";
  if (ext.endsWith(".mp4")) type = "video";
  if (ext.endsWith(".mp3")) type = "audio";
  if (ext.match(/\.(png|jpg|jpeg|webp|gif)$/)) type = "image";

  const viewerUrl = `../universe/viewer.html?file=${encodeURIComponent(clean)}&type=${type}`;
  window.open(viewerUrl, "_blank");
}


// === Markdown → HTML ===
export function convertMarkdownToHtml(md) {
  return md
    // Nadpisy
    .replace(/^# (.*)$/gim, "<h1>$1</h1>")
    .replace(/^## (.*)$/gim, "<h2>$1</h2>")
    .replace(/^### (.*)$/gim, "<h3>$1</h3>")
    .replace(/^#### (.*)$/gim, "<h4>$1</h4>")

    // Tučný text
    .replace(/\*\*(.*?)\*\*/gim, "<b style='color:#f8fafc;'>$1</b>")

    // Kurzíva
    .replace(/\*(.*?)\*/gim, "<i>$1</i>")

    // Odkazy
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")

    // Citace
    .replace(/^> (.*)$/gim,
      "<blockquote>$1</blockquote>"
    )

    // Odrážky
    .replace(/^- (.*)$/gim, "<li>$1</li>")

    // Odstavce
    .replace(/\n\n/gim, "<br><br>");
}
