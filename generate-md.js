// generate-md.js
import fs from "fs";
import path from "path";

const baseDir = "./public/assets/docs";

// 🗂️ Seznam článků (stejný jako dřív)
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

// 🪄 Generování
articles.forEach(item => {
  const dir = path.join(baseDir, item.category);
  const filePath = path.join(dir, item.filename);

  fs.mkdirSync(dir, { recursive: true });

  // Pokud už soubor existuje, načteme ho
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8").trim();

    // Pokud už obsahuje >5 řádků, považuj ho za ručně psaný → nepřepisuj
    const lineCount = existing.split("\n").length;
    if (lineCount > 5) {
      console.log(`⚠️  Přeskočeno (ručně upraveno): ${filePath}`);
      return;
    }

    // Jinak aktualizuj text (s nadpisem, pokud chybí)
    const hasTitle = existing.startsWith("# ");
    const md = hasTitle ? `${item.content}\n` : `# ${item.title}\n\n${item.content}\n`;
    fs.writeFileSync(filePath, md, "utf8");
    console.log(`🔄 Aktualizováno: ${filePath}`);
  } else {
    // Nový soubor → přidáme nadpis
    const md = `# ${item.title}\n\n${item.content}\n`;
    fs.writeFileSync(filePath, md, "utf8");
    console.log(`✅ Vytvořen: ${filePath}`);
  }
});

console.log("\n🎉 Hotovo – články byly vygenerovány / aktualizovány!\n");
