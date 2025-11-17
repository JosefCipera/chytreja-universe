console.log("🍪 Cookie lišta načtena");

const banner = document.getElementById("cookie-banner");
const stat = document.getElementById("c-stat");
const marketing = document.getElementById("c-marketing");

function showCookieBanner() {
  const saved = localStorage.getItem("cookie-consent");
  if (!saved) {
    banner.classList.remove("hidden");
  }
}

document.getElementById("cookie-accept-all").onclick = () => {
  localStorage.setItem("cookie-consent", JSON.stringify({
    essential: true,
    stat: true,
    marketing: true
  }));
  banner.classList.add("hidden");
};

document.getElementById("cookie-accept-essential").onclick = () => {
  localStorage.setItem("cookie-consent", JSON.stringify({
    essential: true,
    stat: false,
    marketing: false
  }));
  banner.classList.add("hidden");
};

showCookieBanner();
