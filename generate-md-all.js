// generate-md-all.js
import fs from "fs";
import path from "path";

const baseDir = "./public/assets/docs";

// ✨ 1️⃣ Databáze článků (můžeš libovolně rozšiřovat)
const articles = [
  {
    category: "telo",
    filename: "pohyb.md",
    title: "Proč je pohyb nejsilnější nástroj dlouhověkosti",
    content: `Čtyři pilíře: **síla, stabilita, výdrž (Zone 2), VO₂max**.

- **Síla:** svoboda pohybu, ochrana před zraněním  
- **Stabilita:** koordinace, méně pádů  
- **Zone 2:** mitochondrie, metabolismus, srdce  
- **VO₂max:** prediktor délky života

**Tip:** 3× týdně síla (40–50 min), 4–5× týdně chůze v Zone 2 (30 min).`
  },
  {
    category: "vyziva",
    filename: "principy-vyzivy.md",
    title: "Principy dlouhověké výživy",
    content: `Ne dieta. **Systém**, který udrží výkon a zdraví.

- **Bílkoviny:** 1.6–2.2 g/kg  
- **Glukóza:** žádné horské dráhy  
- **Tuky:** kvalita > kvantita  
- **Půst:** flexibilita, ne dogma

**Tip:** Jez v klidu. První sousto až když jsi v pohodě.`
  },
  {
    category: "mysl",
    filename: "odolnost.md",
    title: "Psychická odolnost v praxi",
    content: `Denní mini-rutiny > občasný “detox”.

- 3 věci denně: vděčnost  
- 5 minut dýchání  
- krátká procházka bez mobilu  

**Tip:** Odolnost je dovednost – trénuj ji jako sílu.`
  },
  {
    category: "spanek",
    filename: "jak-lepe-spat.md",
    title: "Jak spát lépe už dnes",
    content: `Spánek je nejlepší “biohack”.

- světlo ráno, tma večer  
- chladnější ložnice  
- pravidelný režim  

**Tip:** hodinu před spaním bez displejů. Krátká kniha, teplá sprcha.`
  }
];

// ✨ 2️⃣ Rekurzivní doplnění nadpisů ve všech MD
function addHeadingsRecursively(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      addHeadingsRecursively(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      ensureHeading(fullPath);
    }
  });
}

function ensureHeading(filePath) {
  let content = fs.readFileSync(filePath, "utf8").trim();

  if (content.startsWith("# ")) {
    console.log(`✅ Nadpis již existuje: ${filePath}`);
    return;
  }

  const base = path.basename(filePath, ".md");
  const title = base.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const updated = `# ${title}\n\n${content}\n`;

  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`🆕 Doplněn nadpis: ${filePath}`);
}

// ✨ 3️⃣ Vygenerování nových článků (z článků výše)
function generateArticles() {
  articles.forEach(item => {
    const dir = path.join(baseDir, item.category);
    const filePath = path.join(dir, item.filename);
    fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, "utf8").trim();
      const lineCount = existing.split("\n").length;

      if (lineCount > 5) {
        console.log(`⚠️  Přeskočeno (ručně upraveno): ${filePath}`);
        return;
      }

      const hasTitle = existing.startsWith("# ");
      const md = hasTitle
        ? `${item.content}\n`
        : `# ${item.title}\n\n${item.content}\n`;
      fs.writeFileSync(filePath, md, "utf8");
      console.log(`🔄 Aktualizováno: ${filePath}`);
    } else {
      const md = `# ${item.title}\n\n${item.content}\n`;
      fs.writeFileSync(filePath, md, "utf8");
      console.log(`✅ Vytvořen: ${filePath}`);
    }
  });
}

// ✨ 4️⃣ Spuštění
console.log("🧠 Spouštím generování a kontrolu článků...\n");

generateArticles(); // nejdřív vytvoř / doplň články
addHeadingsRecursively(baseDir); // pak doplň nadpisy všude

console.log("\n🎉 Hotovo! Všechny články jsou aktuální a mají nadpisy.\n");
