// ===========================
// CHYTRÉ JÁ — APP.JS (FULL CLEAN v2)
// ===========================
let contentData = { library: [], dictionary: [] };

// --- Firebase ---
const auth = window.firebaseAuth;

// --- Views registry ---
const views = {
  login: document.getElementById("login-view"),
  register: document.getElementById("register-view"),
  chat: document.getElementById("chat-view"),
  library: document.getElementById("library-view"),
  terms: document.getElementById("terms-view"),
  privacy: document.getElementById("privacy-view"),
};

// Globální data
let libraryData = [];
let dictionaryData = [];

// ===========================
// VIEW SWITCHER
// ===========================
export function showView(id) {
  Object.keys(views).forEach(v => {
    if (views[v]) views[v].classList.add("hidden");
  });
  if (views[id]) views[id].classList.remove("hidden");
}
window.showView = showView;

// ===========================
// LOAD LEGAL DOCUMENTS (HTML)
// ===========================
async function loadHtmlInto(targetId, filePath) {
  try {
    const html = await fetch(filePath).then(r => r.text());
    document.getElementById(targetId).innerHTML = DOMPurify.sanitize(html);
  } catch (err) {
    document.getElementById(targetId).innerHTML = "<p>Nelze načíst obsah.</p>";
  }
}

// ====================================
// BEZPEČNÉ NAČÍTÁNÍ MODELOVÝCH SOUBORŮ
// ====================================
async function loadModels() {

  // --- Výsledná data (zatím prázdná) ---
  let libraryData = [];
  let dictionaryData = [];

  // --- Načtení library.json (pokud existuje) ---
  try {
    const libRes = await fetch("data/models/library.json");
    if (libRes.ok) {
      libraryData = await libRes.json();
      console.log("📚 Načtena knihovna:", libraryData);
    } else {
      console.warn("⚠️ library.json neexistuje – pokračuji bez knihovny.");
    }
  } catch (e) {
    console.warn("⚠️ Nepodařilo se načíst library.json – pravděpodobně neexistuje.");
  }

  // --- Načtení dictionary.json (pokud existuje) ---
  try {
    const dictRes = await fetch("data/models/dictionary.json");
    if (dictRes.ok) {
      dictionaryData = await dictRes.json();
      console.log("📘 Načten slovník:", dictionaryData);
    } else {
      console.warn("⚠️ dictionary.json neexistuje – pokračuji bez slovníku.");
    }
  } catch (e) {
    console.warn("⚠️ Nepodařilo se načíst dictionary.json – pravděpodobně neexistuje.");
  }

  // --- Uložení do globálního contentData ---
  contentData.library = libraryData;
  contentData.dictionary = dictionaryData;

  // --- Pokud library existuje, renderuj ---
  if (libraryData.length > 0) {
    renderLibrary && renderLibrary();
  }
}

// ===========================
// RENDER LIBRARY + DICTIONARY
// ===========================
function renderLibrary() {
  const searchTerm = document.getElementById("library-search-input").value.trim().toLowerCase();
  const container = document.getElementById("library-content");

  let html = "";

  // --- Library items ---
  const filteredLibrary = libraryData.filter(item =>
    item.title.toLowerCase().includes(searchTerm)
  );

  filteredLibrary.forEach(item => {
    html += `
            <div class="mb-4 p-4 border rounded-lg">
                <h3 class="text-xl font-semibold">${item.title}</h3>
                <p>${item.description}</p>
            </div>`;
  });

  // --- Dictionary (TOC) ---
  const filteredDictionary = dictionaryData.filter(item =>
    item.term.toLowerCase().includes(searchTerm)
  );

  if (filteredDictionary.length > 0) {
    html += `<h2 class="text-xl font-bold mt-6">Slovník</h2><dl class="mt-2">`;

    filteredDictionary.forEach(item => {
      html += `<dt class="font-semibold mt-2">${item.term}</dt>
                     <dd>${item.definition}</dd>`;
    });

    html += "</dl>";
  }

  container.innerHTML = html || `<p class="text-gray-500">Nic nenalezeno.</p>`;
}

// ===========================
// CHAT
// ===========================
function addChatMessage(text, sender = "ai") {
  const messages = document.getElementById("chat-messages");
  const wrapper = document.createElement("div");
  wrapper.className = `flex ${sender === "user" ? "justify-end" : "justify-start"} mb-2`;

  wrapper.innerHTML = `
        <div class="max-w-lg p-3 rounded-lg shadow-md 
            ${sender === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}">
            ${text}
        </div>`;

  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function handleChatSend() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text) return;

  addChatMessage(text, "user");
  input.value = "";

  setTimeout(() => addChatMessage("Zpracovávám...", "ai"), 600);
}

// ===========================
// AUTH: LOGIN / REGISTER / LOGOUT
// ===========================
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// --- Login ---
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("email-address").value;
  const pass = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, pass)
    .catch(() => document.getElementById("error-message").innerText = "Nesprávné údaje.");
});

// --- Register ---
document.getElementById("register-form").addEventListener("submit", e => {
  e.preventDefault();

  const email = document.getElementById("register-email").value;
  const pass = document.getElementById("register-password").value;
  const pass2 = document.getElementById("password-confirm").value;

  if (pass !== pass2) {
    document.getElementById("register-error-message").innerText = "Hesla se neshodují.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, pass)
    .catch(() => document.getElementById("register-error-message").innerText = "Registrace selhala.");
});

// --- Forgot ---
document.getElementById("forgot-password-link").addEventListener("click", () => {
  const email = document.getElementById("email-address").value;
  sendPasswordResetEmail(auth, email)
    .then(() => document.getElementById("forgot-password-message").innerText = "Odesláno.")
    .catch(() => document.getElementById("forgot-password-message").innerText = "Chyba.");
});

// --- Logout ---
document.getElementById("logout-button").addEventListener("click", () => signOut(auth));

// ===========================
// NAVIGATION BUTTONS
// ===========================
document.getElementById("show-register-link").onclick = () => showView("register");
document.getElementById("show-login-link").onclick = () => showView("login");
document.getElementById("terms-link").onclick = () => { loadHtmlInto("terms-content", "/web/legal/obchodni-podminky.html"); showView("terms"); };
document.getElementById("privacy-link").onclick = () => { loadHtmlInto("privacy-content", "/web/legal/ochrana-osobnich-udaju.html"); showView("privacy"); };
document.getElementById("library-button").onclick = () => showView("library");

// ===========================
// SEARCH INPUT IN LIBRARY
// ===========================
document.getElementById("library-search-input").addEventListener("input", renderLibrary);

// ===========================
// CHAT SEND BUTTON
// ===========================
document.getElementById("chat-mic-button").addEventListener("click", handleChatSend);

// ===========================
// AUTH STATE LISTENER
// ===========================
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("user-email").innerText = user.email;
    showView("chat");
  } else {
    showView("login");
  }
});

// ===========================
// INITIAL LOAD
// ===========================
loadModels().then(renderLibrary);
