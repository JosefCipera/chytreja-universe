import { AI_CONFIG } from "./ai-config.js";

const chatContainer = document.getElementById("chatContainer");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const closeBtn = document.getElementById("closeChat");

// === Inicializace ===
appendMessage(AI_CONFIG.welcomeMessage, "ai");
showMiniHelper();

// === Stavové přepínače ===
function showMiniHelper() {
  chatContainer.classList.remove("hidden", "expanded");
  chatContainer.classList.add("mini");
}

function expandHelper() {
  chatContainer.classList.remove("mini");
  chatContainer.classList.add("expanded");
}

function hideHelper() {
  chatContainer.classList.remove("expanded", "mini");
  chatContainer.classList.add("hidden");
}

// === Ovládání ===
userInput.addEventListener("focus", expandHelper);
closeBtn.addEventListener("click", showMiniHelper);
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// === Logika chatu ===
function appendMessage(text, sender = "ai") {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage(text, "user");
  userInput.value = "";

  setTimeout(() => {
    const reply = getDemoResponse(text);
    appendMessage(reply, "ai");
  }, 600);
}

function getDemoResponse(text) {
  const t = text.toLowerCase();
  if (t.includes("vo2max")) return "VO₂max zlepšíš tréninkem v Zone 2 a občasným sprintem. 🚴‍♂️";
  if (t.includes("spánek")) return "Zkus večer méně modrého světla a ložnici pod 19°C. 😴";
  if (t.includes("výroba")) return "Úzké místo není nepřítel, ale příležitost k růstu. ⚙️";
  if (t.includes("finance")) return "Finance v TOC jsou důsledkem, ne cílem. 💰";
  const random = Math.floor(Math.random() * AI_CONFIG.fallbackResponses.length);
  return AI_CONFIG.fallbackResponses[random];
}
