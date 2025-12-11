// === Globální proměnné ===
let IS_USER_LOGGED_IN = true;
const contentData = {};
let fuse;

// Stav pro knihovnu
let libraryCurrentPage = 1;
const libraryRowsPerPage = 6;
let libraryActiveTag = 'all';

// Odkazy na HTML elementy (pohledy)
const views = {
  'home': document.getElementById('home-view'),
  'info': document.getElementById('info-view'),
  'chat': document.getElementById('chat-view'),
  'terms': document.getElementById('terms-view'),
  'privacy': document.getElementById('privacy-view'),
  'library': document.getElementById('library-view'),
  'content': document.getElementById('content-view'),
  'checklist': document.getElementById('checklist-view'),
  'production-plan-view': document.getElementById('production-plan-view'),
  'minidashboard-view': document.getElementById('minidashboard-view'),
  'dashboard-view': document.getElementById('dashboard-view'),
  'iframe-view': document.getElementById('iframe-view'),
};

const modalElement = document.getElementById('media-modal');

// === Mobilní menu ===
function setupMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      mobileMenu.classList.add('hidden');
    }
  });
}

// === Modální okno ===
function openModal(contentHtml) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = contentHtml;
  modalElement.classList.remove('hidden');
  modalElement.classList.add('flex');
}

function closeModal() {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '';
  modalElement.classList.add('hidden');
  modalElement.classList.remove('flex');
}

// === Zobrazení obsahu knihovny ===
function showMediaInModal(itemId) {
  const item = contentData.library.find(i => i.id === itemId);
  if (!item) return;
  let contentHtml = '';

  switch (item.type) {
    case 'video':
      let embedUrl = '';
      try {
        const url = new URL(item.url);
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
          let videoId = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v');
          if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.hostname.includes('vimeo.com')) {
          const videoId = url.pathname.split('/').pop();
          if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
      } catch (e) {
        console.error("Chybná URL videa:", item.url, e);
      }

      contentHtml = embedUrl
        ? `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>`
        : `<p class="text-center text-red-500">Nepodařilo se načíst video.</p>`;
      break;

    case 'image':
      contentHtml = `<img src="${item.url}" alt="${item.title}" class="max-w-full max-h-[80vh] mx-auto rounded">`;
      break;

    case 'audio':
      contentHtml = `
        <div>
          <h3 class="text-2xl font-bold mb-4">${item.title}</h3>
          <audio controls src="${item.url}" class="w-full">Váš prohlížeč nepodporuje přehrávání audia.</audio>
        </div>`;
      break;
  }

  if (contentHtml) openModal(contentHtml);
}

// === Načítání článku (Markdown/HTML) ===
function showContent(itemId) {
  const contentContainer = document.getElementById('content-dynamic');
  if (!contentContainer || !contentData.library) return;

  const item = contentData.library.find(i => i.id === itemId);
  if (!item) {
    contentContainer.innerHTML = '<h1>Chyba</h1><p>Článek nebyl nalezen.</p>';
    showView('content');
    return;
  }

  if (item.contentUrl) {
    fetch(item.contentUrl)
      .then(response => response.text())
      .then(markdownText => {
        contentContainer.innerHTML = convertMarkdownToHtml(markdownText);
        showView('content');
      })
      .catch(error => {
        console.error('Chyba při načítání článku:', error);
        contentContainer.innerHTML = '<p>Nelze načíst obsah článku.</p>';
        showView('content');
      });
  } else if (item.contentBody) {
    contentContainer.innerHTML = `<h2>${item.contentTitle}</h2>${item.contentBody}`;
    showView('content');
  }
}

// === Markdown převodník ===
function convertMarkdownToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    if (line.trim().startsWith('> ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<blockquote style="border-left:4px solid #93c5fd;padding-left:1em;margin:1em 0;color:#4b5563;">${line.trim().substring(2)}</blockquote>`;
      continue;
    }

    if (line.startsWith('## ')) { html += `<h2>${line.substring(3)}</h2>`; continue; }
    if (line.startsWith('# ')) { html += `<h1>${line.substring(2)}</h1>`; continue; }

    if (line.trim().startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.trim().substring(2)}</li>`;
      continue;
    }

    if (inList) { html += '</ul>'; inList = false; }
    if (line.trim() !== '') html += `<p>${line}</p>`;
  }

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  return html;
}

// === Knihovna ===
function renderLibrary() {
  const libraryGrid = document.getElementById('library-grid');
  const tagsContainer = document.getElementById('library-tags-container');
  const searchInput = document.getElementById('library-search');
  const paginationContainer = document.getElementById('library-pagination');
  if (!libraryGrid || !contentData.library) return;

  const searchText = searchInput.value.trim().toLowerCase();
  let sourceItems = searchText === '' ? contentData.library : fuse.search(searchText).map(result => result.item);
  const taggedItems = libraryActiveTag === 'all' ? sourceItems : sourceItems.filter(item => item.tags && item.tags.includes(libraryActiveTag));
  const fullyFilteredItems = taggedItems.filter(item => item.published !== false);

  libraryGrid.innerHTML = '';
  if (fullyFilteredItems.length === 0) {
    libraryGrid.innerHTML = `<p class="text-center text-gray-500">Žádné materiály nenalezeny.</p>`;
  } else {
    fullyFilteredItems.slice((libraryCurrentPage - 1) * libraryRowsPerPage, libraryCurrentPage * libraryRowsPerPage)
      .forEach(item => {
        let action = '';
        if (['video', 'audio', 'image'].includes(item.type)) action = `showMediaInModal('${item.id}')`;
        else if (item.type === 'article') action = `showContent('${item.id}')`;
        else action = `window.open('${item.url}', '_blank')`;

        libraryGrid.innerHTML += `
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div class="flex items-center mb-3">
              <i class="${item.icon} text-2xl mr-3 text-blue-600"></i>
              <h3 class="font-bold text-xl">${item.title}</h3>
            </div>
            <p class="text-gray-700 mb-3">${item.description}</p>
            <button onclick="${action}" class="text-blue-600 font-semibold hover:underline">${item.linkText} →</button>
          </div>`;
      });
  }
}

// === Pohledy ===
function showView(viewId) {
  for (let id in views) {
    if (views[id]) views[id].classList.remove('active');
  }
  if (views[viewId]) views[viewId].classList.add('active');
}

// === Navigace ===
function setupNavigation() {
  document.querySelectorAll('nav a, a[href^="#"]').forEach(el => {
    el.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// === 💬 CHYTRÉ JÁ – AI Chat pro Reference a FAQ ===
window.CHYTREJA_KB = [
  { type: "faq", q: "Jak funguje Chytré Já?", a: "Chytré Já je digitální průvodce firmou, který propojuje data, AI a hlasové povely do jednotného systému řízení." },
  { type: "faq", q: "Jak získám přístup do vesmíru Chytrého Já?", a: "Přístup lze aktivovat v části Ceník – úrovně Start, Pro nebo Enterprise." },
  { type: "reference", q: "Ve výrobní firmě ABC se po nasazení Chytrého Já zvýšila produktivita o 15 %", a: "AI analyzovalo výrobní cykly a optimalizovalo rozdělení zakázek." },
  { type: "reference", q: "Firma Delta Finance nasadila Chytré Já pro automatizaci reportingu", a: "Zpracování dat se zkrátilo ze 3 dnů na 1 hodinu a chyby zmizely." }
];

function appendMsg(sender, text) {
  const chatLog = document.getElementById("chat-log");
  if (!chatLog) return;
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "text-right mb-2" : "text-left mb-2";
  msg.innerHTML = `<div class="${sender === "user"
    ? "inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
    : "inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
    }">${text}</div>`;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function getSmartAnswer(input) {
  const lower = input.toLowerCase();
  return window.CHYTREJA_KB.find(item =>
    lower.includes(item.q.toLowerCase().split(" ")[0])
  );
}

function askChytreJa(inputText) {
  const answerData = getSmartAnswer(inputText);
  if (answerData) {
    if (answerData.type === "faq") appendMsg("ai", answerData.a);
    else appendMsg("ai", `Zkušenost z praxe: ${answerData.q}. ${answerData.a}`);
  } else appendMsg("ai", "Na to zatím nemám odpověď, ale učím se každým dnem. 🌱");
}

// === Inicializace ===
document.addEventListener('DOMContentLoaded', () => {
  fetch('content.json')
    .then(r => r.json())
    .then(data => {
      Object.assign(contentData, data);
      if (contentData.library) {
        fuse = new Fuse(contentData.library, {
          includeScore: true,
          threshold: 0.3,
          keys: ['title', 'description', 'tags']
        });
      }
      renderLibrary();
      setupNavigation();
      setupMobileMenu();
    });

  const sendBtn = document.getElementById("chat-send");
  const input = document.getElementById("chat-input");
  if (sendBtn && input) {
    sendBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) return;
      appendMsg("user", text);
      askChytreJa(text);
      input.value = "";
    });
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") sendBtn.click();
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("chat-input");
  const sendButton = document.getElementById("chat-send-button");
  const messages = document.getElementById("chat-messages");

  if (!input || !sendButton || !messages) return;

  function addMessage(text, sender = "user") {
    const wrapper = document.createElement("div");
    wrapper.className = "chat-message " + (sender === "user" ? "user" : "ai");
    wrapper.textContent = text;
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    // Dočasná animace "..."
    const thinking = document.createElement("div");
    thinking.className = "flex justify-start";
    thinking.innerHTML =
      '<div class="bg-slate-700 text-gray-400 p-3 rounded-lg max-w-[75%] italic">...</div>';
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    // Simulovaná odpověď
    setTimeout(() => {
      thinking.remove();
      addMessage(getSimulatedReply(text), "ai");
    }, 1500);
  }

  function getSimulatedReply(q) {
    q = q.toLowerCase();
    if (q.includes("ahoj")) return "Ahoj! 😊 Jak ti mohu pomoci?";
    if (q.includes("co umíš")) return "Umím analyzovat, plánovat a pomáhat s řízením procesů.";
    if (q.includes("tabidoo")) return "Tabidoo propojuji s tvými příkazy a daty v reálném čase.";
    if (q.includes("vesmír")) return "Tvůj digitální vesmír? 🌌 Ten nemá hranice — stejně jako tvoje data.";
    return "To je zajímavá otázka — můžeš mi ji prosím upřesnit?";
  }

  sendButton.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
async function loadTexts(lang = "cs") {
  try {
    const response = await fetch(`./data/models/texts.json`);
    const data = await response.json();

    // Sekce "O nás"
    const onas = data.onas;
    if (onas) {
      const onasSection = document.querySelector("#onas .about-content");
      if (onasSection) {
        onasSection.innerHTML = `
          <div class="about-header"><h2>${onas.heading}</h2></div>
          ${onas.paragraphs.map(p => `<p>${p}</p>`).join("")}
        `;
      }
    }

    // Sekce "Ceník"
    const cenik = data.cenik;
    if (cenik) {
      const pricing = document.querySelector("#cenik .pricing");
      if (pricing) {
        pricing.innerHTML = cenik.plans.map(plan => `
          <div class="price-card ${plan.highlight ? "highlight" : ""}">
            <h3>${plan.icon} ${plan.name}</h3>
            <div class="price">${plan.price}</div>
            <p>${plan.desc}</p>
          </div>
        `).join("");
      }
    }

    // Sekce "Kontakt"
    const kontakt = data.kontakt;
    if (kontakt) {
      const intro = document.querySelector("#kontakt p");
      if (intro) intro.textContent = kontakt.intro;
    }

    console.log("✅ Texty načteny:", lang);
  } catch (err) {
    console.error("❌ Chyba při načítání JSON:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => loadTexts());
/* ==========================
   Jemný parallax scroll efekt
========================== */

const parallaxItem = document.querySelector(".parallax-item");

if (parallaxItem) {
  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    // jemný posun: 0.05 = velmi decentní
    const offset = scrollY * 0.05;

    // transformační posun
    parallaxItem.style.transform = `translateY(${offset}px)`;
  });
}


