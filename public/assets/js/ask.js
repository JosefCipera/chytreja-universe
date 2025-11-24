// =============== ASK.JS – Odpovědní box ===============

// Elementy
const askInput = document.getElementById("askInput");
const askBtn = document.getElementById("askBtn");
const askOutput = document.getElementById("askOutput");

// === Fake odpověď (zatím bez OpenAI) ===
// Tady později připojíme API → pouze nahradíš return.
function fakeAnswer(question) {
  const answers = [
    "To je skvělá otázka. U chytrého řízení je důležité mít vždy jasný směr.",
    "Když spojíš zdraví, energii a výkon, začnou se dít zajímavé věci.",
    "Doporučuji začít u jedné malé změny, která se opakuje každý den.",
    "Chytré já má pomáhat zjednodušovat — ne komplikovat. Proto se držíme principů TOC.",
    "Nejlepší cesta vpřed je ta, která je dlouhodobě udržitelná.",
  ];
  return answers[Math.floor(Math.random() * answers.length)];
}

// === Zobrazení bubliny (otázky i odpovědi) ===
function addBubble(text, type = "user") {
  const bubble = document.createElement("div");
  bubble.className = "ask-bubble " + type;
  bubble.innerHTML = text;

  askOutput.appendChild(bubble);

  // autoscroll
  askOutput.scrollTop = askOutput.scrollHeight;
}

// === Animace „přemýšlení“ ===
function addThinkingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "ask-bubble thinking";
  bubble.innerHTML = "⋯";

  askOutput.appendChild(bubble);
  askOutput.scrollTop = askOutput.scrollHeight;

  return bubble;
}

// === Hlavní odeslání dotazu ===
askBtn.addEventListener("click", () => {
  const question = askInput.value.trim();
  if (!question) return;

  askInput.value = "";

  // zobraz otázku
  addBubble(question, "user");

  // animace myšlení
  const thinking = addThinkingBubble();

  setTimeout(() => {
    thinking.remove();

    const answer = fakeAnswer(question);
    addBubble(answer, "ai");
  }, 600);
});
// === Quick buttons ===
document.querySelectorAll(".ask-quick-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    askInput.value = btn.innerText;
    askBtn.click();
  });
});

