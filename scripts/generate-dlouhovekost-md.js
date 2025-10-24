// === generate-dlouhovekost-md.js ===
// 🧠 Vytvoří články pro model dlouhověkosti do správných podsložek
// Spustíš: node scripts/generate-dlouhovekost-md.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 🔹 Určení korektního rootu projektu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../public/assets/docs/dlouhovekost");

console.log(`📁 Projektový root: ${projectRoot}`);

// 🗂️ Seznam článků pro Dlouhověkost
const articles = [
  {
    category: "",
    filename: "uvod.md",
    title: "Jak přemýšlet o dlouhověkosti",
    content: `Peter Attia chápe dlouhověkost jako inženýrský problém – plánuj, měř a optimalizuj.  
Není to dieta ani cvičení, ale systém řízení života.

- Měř to, co chceš zlepšit  
- Začni dřív, než musíš  
- Každý den o 1 % lepší

> Dlouhověkost = řízení života, ne reakce na stáří.`
  },
  {
    category: "zdravi",
    filename: "zaklady-zdravi.md",
    title: "Zdraví jako zrcadlo tvých návyků",
    content: `Zdraví je ukazatel, jak dobře fungují tvé návyky.  
Změny ve spánku, stravě a pohybu se odrážejí v krvi, tlaku i psychice.

- Sleduj VO₂max  
- Měř krevní tlak a glukózu  
- Kontroluj HRV

Zdraví je systémová zpětná vazba. Dá se řídit, ne jen doufat.`
  },
  {
    category: "telo",
    filename: "centenarian-decathlon.md",
    title: "Centenarian Decathlon: připrav se na stovku",
    content: `Attiův koncept „Centenarian Decathlon“ říká: trénuj pro život, ne pro výkon.

- Síla = svoboda pohybu  
- Stabilita = méně pádů  
- Zone 2 = zdravé srdce

Nejde o cvičení, ale o funkčnost. Buď člověk, který zvládne žít s radostí i v 90.`
  },
  {
    category: "mysl",
    filename: "odolnost.md",
    title: "Jak trénovat mentální odolnost",
    content: `Mysl je stejně důležitá jako tělo.  
Odolnost se dá trénovat — disciplínou, klidem a přítomností.

- Každý den 5 minut ticha  
- Vděčnost místo porovnávání  
- Odpoj se od displejů před spaním

Mír v hlavě = síla v těle.`
  },
  {
    category: "vyziva",
    filename: "principy-vyzivy.md",
    title: "Jak jíst pro dlouhověkost",
    content: `Výživa dlouhověkosti stojí na kvalitě, ne dogmatu.

- Jez pomalu, v klidu  
- Dostatek bílkovin (1,6–2,2 g/kg)  
- Stabilní glukóza  
- Krátké půsty pro regeneraci

> Nehledej zázrak. Stačí dělat obyčejné věci výjimečně konzistentně.`
  }
];

// 🪄 Generování souborů
articles.forEach(item => {
  const dir = path.join(projectRoot, item.category);
  const filePath = path.join(dir, item.filename);

  fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8").trim();
    const lineCount = existing.split("\n").length;

    if (lineCount > 5) {
      console.log(`⚠️  Přeskočeno (ručně upraveno): ${filePath}`);
      return;
    }
  }

  const md = `# ${item.title}\n\n${item.content}\n`;
  fs.writeFileSync(filePath, md, "utf8");
  console.log(`✅ Vytvořeno: ${filePath}`);
});

console.log("\n🎉 Hotovo – články pro Dlouhověkost byly vygenerovány!\n");
