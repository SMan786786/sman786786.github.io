(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer date.
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation: close after selection and support Escape.
  const menuToggle = $(".menu-toggle");
  const navLinks = $("#nav-links");
  const closeMenu = () => {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  };
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      navLinks.classList.toggle("open", open);
    });
    $$("a", navLinks).forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", event => {
      if (navLinks.classList.contains("open") &&
          !navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
  }

  // Theme preference, with storage failure handled for privacy-restricted contexts.
  const themeToggle = $(".theme-toggle");
  const themeMeta = $('meta[name="theme-color"]');
  const readTheme = () => {
    try { return localStorage.getItem("mansoor-theme"); } catch { return null; }
  };
  const saveTheme = value => {
    try { localStorage.setItem("mansoor-theme", value); } catch { /* Session-only theme is still usable. */ }
  };
  const applyTheme = dark => {
    document.body.classList.toggle("theme-dark", dark);
    if (themeToggle) {
      $(".theme-icon", themeToggle).textContent = dark ? "☀" : "☾";
      $(".theme-label", themeToggle).textContent = dark ? "Light mode" : "Dark mode";
      themeToggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("aria-pressed", String(dark));
    }
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#151a16" : "#f5f4ef");
  };
  if (themeToggle) {
    const saved = readTheme();
    applyTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    themeToggle.addEventListener("click", () => {
      const dark = !document.body.classList.contains("theme-dark");
      applyTheme(dark);
      saveTheme(dark ? "dark" : "light");
    });
  }

  // Filter the project grid and expose the active state to assistive technology.
  const filterButtons = $$(".filter-btn");
  const projectCards = $$(".project-card[data-category]");
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
      if (show) card.classList.add("is-visible");
    });
  }));

  // Small scroll reveals; content remains visible if IntersectionObserver is unavailable.
  const revealItems = $$(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Reading progress and active section indicator.
  const progressBar = $("#reading-progress-bar");
  let scrollQueued = false;
  const updateScrollUI = () => {
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progressBar.style.width = (ratio * 100) + "%";
    }
    scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(updateScrollUI);
  }, { passive: true });
  updateScrollUI();

  const sectionLinks = $$(".nav-links a[href^='#']");
  const sections = sectionLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const activeObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach(link => {
        const active = link.getAttribute("href") === "#" + visible.target.id;
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
        link.classList.toggle("active", active);
      });
    }, { rootMargin: "-22% 0px -62% 0px", threshold: [0, .15, .4, .7] });
    sections.forEach(section => activeObserver.observe(section));
  }

  // Project detail dialog: native dialog provides Escape and modal semantics.
  const projectData = {
    commerce: {
      category: "WEB DEVELOPMENT",
      title: "E-commerce website",
      description: "An online headphone store described in the existing portfolio as using React for the interface, Sanity for content and product management, and Stripe for checkout. The linked site is provided as the current project demo.",
      tags: ["React", "Sanity", "Stripe"],
      href: "https://hear-hub-headphones.vercel.app/",
      linkLabel: "Open project"
    },
    chat: {
      category: "WEB DEVELOPMENT",
      title: "Real-time chat application",
      description: "A messaging app described in the existing portfolio as using React and Chat Engine, with real-time messaging, typing indicators, and read receipts. The linked destination is the demo file currently supplied.",
      tags: ["React", "Chat Engine"],
      href: "https://drive.google.com/file/d/16mm2QfMqx17nbExz8j87MOfvkptyLtI9/view?usp=sharing",
      linkLabel: "Open demo"
    },
    vision: {
      category: "COMPUTER VISION",
      title: "Real-time face mask detection",
      description: "A computer-vision project described in the existing portfolio as using OpenCV and MobileNet for mask detection. The external link points to a related research publication.",
      tags: ["OpenCV", "MobileNet"],
      href: "https://link.springer.com/chapter/10.1007/978-981-16-7330-6_39",
      linkLabel: "Read publication"
    }
  };
  const dialog = $("#project-dialog");
  const dialogTitle = $("#dialog-title");
  const dialogCategory = $("#dialog-category");
  const dialogDescription = $("#dialog-description");
  const dialogTags = $("#dialog-tags");
  const dialogLink = $("#dialog-link");
  let lastDialogTrigger = null;
  const closeDialog = () => {
    if (dialog && dialog.open) dialog.close();
  };
  if (dialog && typeof dialog.showModal === "function") {
    $$("[data-open-project]").forEach(button => button.addEventListener("click", () => {
      const item = projectData[button.dataset.openProject];
      if (!item) return;
      lastDialogTrigger = button;
      dialogCategory.textContent = item.category;
      dialogTitle.textContent = item.title;
      dialogDescription.textContent = item.description;
      dialogTags.replaceChildren(...item.tags.map(tag => {
        const span = document.createElement("span");
        span.textContent = tag;
        return span;
      }));
      dialogLink.href = item.href;
      dialogLink.innerHTML = item.linkLabel + ' <span aria-hidden="true">↗</span>';
      dialog.showModal();
      const closeButton = $(".dialog-close", dialog);
      if (closeButton) closeButton.focus();
    }));
    $$(".dialog-close", dialog).forEach(button => button.addEventListener("click", closeDialog));
    dialog.addEventListener("click", event => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => {
      if (lastDialogTrigger) lastDialogTrigger.focus();
    });
  } else {
    $$("[data-open-project]").forEach(button => {
      button.addEventListener("click", () => {
        const item = projectData[button.dataset.openProject];
        if (item) window.open(item.href, "_blank", "noopener,noreferrer");
      });
    });
  }

  // Copy-to-clipboard with a manual fallback and clear status feedback.
  const copyButton = $("#copy-email");
  const copyStatus = $("#copy-status");
  const copyLabel = $("#copy-label");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const email = copyButton.dataset.email;
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          copied = true;
        }
      } catch { copied = false; }
      if (!copied) {
        const field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        try { copied = document.execCommand("copy"); } catch { copied = false; }
        field.remove();
      }
      if (copyStatus) copyStatus.textContent = copied ? "Email address copied to clipboard." : "Copy unavailable here — select the email address above.";
      if (copyLabel) copyLabel.textContent = copied ? "Copied" : "Try again";
      if (copied) window.setTimeout(() => { if (copyLabel) copyLabel.textContent = "Copy email"; }, 2200);
    });
  }

  // Live GitHub stats. Never substitute guessed values; show a calm fallback on API errors.
  const statsContainer = $("#github-stats");
  const statsStatus = $("#stats-status");
  const githubApiHeaders = { Accept: "application/vnd.github+json" };
  const setStat = (name, value, note) => {
    const node = $("[data-stat='" + name + "']", statsContainer);
    if (!node) return;
    $("strong", node).textContent = Number.isFinite(value) ? value.toLocaleString() : "—";
    $("small", node).textContent = note;
  };
  const loadGithubStats = async () => {
    if (!statsContainer) return;
    try {
      const profileResponse = await fetch("https://api.github.com/users/SMan786786", { headers: githubApiHeaders });
      if (!profileResponse.ok) throw new Error("GitHub profile request failed");
      const profile = await profileResponse.json();
      if (typeof profile.public_repos !== "number" || typeof profile.followers !== "number") throw new Error("Unexpected GitHub response");
      setStat("repos", profile.public_repos, "Public repositories");
      setStat("followers", profile.followers, "GitHub followers");
      if (statsStatus) statsStatus.textContent = "Profile data loaded from the GitHub public API.";
      try {
        const reposResponse = await fetch("https://api.github.com/users/SMan786786/repos?per_page=100&type=owner&sort=updated", { headers: githubApiHeaders });
        if (!reposResponse.ok) throw new Error("Repository request failed");
        const repositories = await reposResponse.json();
        if (!Array.isArray(repositories)) throw new Error("Unexpected repositories response");
        const stars = repositories.reduce((total, repository) => total + (Number(repository.stargazers_count) || 0), 0);
        setStat("stars", stars, "Stars across returned public repositories");
      } catch {
        setStat("stars", NaN, "Not available right now");
      }
    } catch {
      setStat("repos", NaN, "Unavailable right now");
      setStat("followers", NaN, "Unavailable right now");
      setStat("stars", NaN, "Unavailable right now");
      if (statsStatus) statsStatus.textContent = "GitHub’s public API couldn’t be reached. Use the profile link to see current activity.";
    } finally {
      statsContainer.setAttribute("aria-busy", "false");
    }
  };
  // The live panel is useful but must not delay the rest of the page.
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => { void loadGithubStats(); }, { timeout: 1800 });
  else window.setTimeout(() => { void loadGithubStats(); }, 250);
})();