// Jemná animace při scrollování
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".founders-card, .reason, .faq-item").forEach(el => {
  observer.observe(el);
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".founders-card");

  cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
  });

  let index = 0;
  const animate = () => {
    if (index < cards.length) {
      const c = cards[index];
      c.style.transition = "0.5s ease";
      c.style.opacity = "1";
      c.style.transform = "translateY(0)";
      index++;
      setTimeout(animate, 120);
    }
  };

  animate();
});
