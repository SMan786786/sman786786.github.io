const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

// Theme preference toggle.
const themeToggle = document.querySelector(".theme-toggle");
if (themeToggle) {
  const savedTheme = (() => { try { return localStorage.getItem("mansoor-theme"); } catch { return null; } })();
  if (savedTheme === "dark") document.body.classList.add("dark-theme");
  const updateThemeButton = () => {
    const dark = document.body.classList.contains("dark-theme");
    themeToggle.innerHTML = dark ? "☀ <span>Theme</span>" : "☾ <span>Theme</span>";
    themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  };
  updateThemeButton();
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    try { localStorage.setItem("mansoor-theme", document.body.classList.contains("dark-theme") ? "dark" : "light"); } catch {}
    updateThemeButton();
  });
}

// Filter project cards by discipline.
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card[data-category]");
filterButtons.forEach(button => button.addEventListener("click", () => {
  const filter = button.dataset.filter;
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  projectCards.forEach(card => {
    const show = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !show);
    if (show) requestAnimationFrame(() => card.classList.add("visible"));
  });
}));

// Reveal content as it enters the viewport; keep everything visible if unsupported.
const revealItems = document.querySelectorAll(".project-card, .principles > div, .skill-group, .contact-links a");
revealItems.forEach(item => item.classList.add("reveal"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else revealItems.forEach(item => item.classList.add("visible"));

// Subtle pointer tilt on desktop; disabled for touch and reduced-motion users.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      if (card.classList.contains("is-hidden")) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// Scroll progress indicator.
const progress = document.querySelector(".scroll-progress");
const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + "%";
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
