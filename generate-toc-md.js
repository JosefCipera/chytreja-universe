// === generate-toc-md.js ===
// 🧠 Vytvoří články pro TOC model do správných podsložek
// Spustíš: node generate-toc-md.js

const fs = require("fs");
const path = require("path");

// 📁 Základní adresář
const baseDir = "./public/assets/docs/toc";

// 🗂️ Seznam článků TOC
const articles = [
  {
    category: "",
    filename: "uvod-toc.md",
    title: "Úvod do Teorie omezení",
    content: `Každý systém má místo, které určuje jeho výsledek — úzké hrdlo, které zpomaluje všechno ostatní.

Teorie omezení (TOC) učí, že zlepšovat všechno znamená zlepšovat nic. Stačí odstranit jednu překážku – tu pravou.

Goldratt přinesl jednoduché pravidlo: **Najdi omezení, rozhodni se, jak ho využít, podřiď mu zbytek systému, posil ho a vrať se na začátek.**

**Takeaway:**  
> Zlepšuj to, co skutečně brání růstu – ne to, co je nejvíc vidět.`
  },
  {
    category: "ccpm",
    filename: "ccpm-uvod.md",
    title: "Kritický řetěz – řízení projektů bez multitaskingu",
    content: `Projekty selhávají ne kvůli lidem, ale kvůli způsobu, jakým je plánujeme.  
CCPM (Critical Chain Project Management) mění pohled na čas: chrání úzké místo projektu – **kritický řetěz**.

Každý projekt má jen jeden rytmus. Když ho přerušíme, ztratíme tok.  
CCPM proto eliminuje multitasking, vytváří ochranné rezervy (buffer) a dává lidem klid pracovat na tom, co má skutečný dopad.

**Takeaway:**  
> Projekt neurychlíš tím, že budeš dělat víc věcí. Ale tím, že odstraníš přetížení.`
  },
  {
    category: "vyroba",
    filename: "tok-ne-vytizeni.md",
    title: "Tok, ne vytížení",
    content: `Výroba není o tom, aby stroje jely na sto procent. Je o tom, aby práce plynula bez přerušení.

Metoda **Drum–Buffer–Rope (DBR)** řídí systém podle úzkého místa – bubnu, který určuje rytmus celé továrny.  
Všechno ostatní se přizpůsobuje tomuto rytmu.  
Tím se výroba stává plynulým tokem, ne chaotickým bojem o výkon.

**Takeaway:**  
> Cílem výroby není vyrábět víc, ale vydělávat víc – plynulým tokem práce.`
  },
  {
    category: "finance",
    filename: "tri-ukazatele.md",
    title: "Tři ukazatele výkonu firmy",
    content: `Tradiční účetnictví měří minulost. TOC měří **tok peněz** teď a v budoucnu.

**Throughput Accounting (TA)** používá tři jednoduché ukazatele:
- **Throughput (T)** – kolik peněz systém vydělá  
- **Inventory (I)** – kolik je vázáno  
- **Operating Expense (OE)** – kolik stojí provoz

Cílem není snižovat náklady, ale zvyšovat throughput.  
Zisk se pak dostaví sám.

**Takeaway:**  
> Peníze nejsou cíl. Jsou důsledek dobrého toku.`
  },
  {
    category: "marketing",
    filename: "uzke-misto-trhu.md",
    title: "Úzké místo na trhu",
    content: `Omezení není jen ve výrobě. Může být i v hlavě zákazníka.

Marketing podle TOC zkoumá, proč si lidé nekupují víc – co jim brání pochopit hodnotu.  
Goldratt mluvil o „úzkém místě trhu“ – když poptávka neodpovídá potenciálu.

Úkolem marketéra je najít toto omezení a odstranit ho pomocí jasné nabídky, ne slevami.

**Takeaway:**  
> Neprodávej víc. Pomoz zákazníkovi lépe chápat, co mu skutečně řešíš.`
  },
  {
    category: "strategie",
    filename: "strategie-rust.md",
    title: "Strategie pro růst",
    content: `Strategie v TOC není o plánu, ale o směru.  
Ptá se: co musíme odstranit, aby systém mohl růst?

To znamená říct „ne“ většině věcí, které rozptylují pozornost.  
**SFS – Strategy for Focus and Simplicity** staví na principu:  
> soustřeď se na to podstatné, zjednoduš zbytek, podporuj tok.

**Takeaway:**  
> Síla strategie není v komplexnosti, ale v jasnosti.`
  }
];

// 🪄 Generování
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
    const md = hasTitle ? `${item.content}\n` : `# ${item.title}\n\n${item.content}\n`;
    fs.writeFileSync(filePath, md, "utf8");
    console.log(`🔄 Aktualizováno: ${filePath}`);
  } else {
    const md = `# ${item.title}\n\n${item.content}\n`;
    fs.writeFileSync(filePath, md, "utf8");
    console.log(`✅ Vytvořen: ${filePath}`);
  }
});

console.log("\n🎉 Hotovo – TOC články byly vygenerovány / aktualizovány!\n");
