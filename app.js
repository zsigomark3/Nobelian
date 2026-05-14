/* ========================================================================
   OVERLAY SYSTEM (SHOP + STORIES)
   ------------------------------------------------------------------------
   This script controls:
   - Opening & closing overlays
   - Handling repeated clicks (toggle behavior)
   - Auto-closing other overlays
   - Closing overlays by clicking outside, pressing ESC
   ======================================================================== */


/* ------------------------------------------------------------------------
   Overlay refs (lazy: navbar/overlays are injected by components.js)
   ------------------------------------------------------------------------ */
function getOverlays() {
  return {
    shop: document.getElementById("shop-overlay"),
    stories: document.getElementById("stories-overlay"),
  };
}


/* ------------------------------------------------------------------------
   openOverlay(id)
   Opens the overlay with fade-in animation.
   Also ensures all other overlays close.
   ------------------------------------------------------------------------ */
function openOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  closeAllOverlays(id);
  if (overlay.classList.contains("active")) return;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}


/* ------------------------------------------------------------------------
   closeOverlay(id)
   Closes a specific overlay.
   ------------------------------------------------------------------------ */
function closeOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove("active");
  if (!anyOverlayOpen()) {
    document.body.style.overflow = "auto";
  }
}


/* ------------------------------------------------------------------------
   closeAllOverlays(except)
   Closes all overlays except the one passed as argument.
   Used when switching between navbar menu items.
   ------------------------------------------------------------------------ */
function closeAllOverlays(except = null) {
  const overlays = getOverlays();
  Object.values(overlays).forEach(overlay => {
    if (overlay && overlay.id !== except) {
      overlay.classList.remove("active");
    }
  });

  // If no overlays remain open → enable scrolling
  if (!anyOverlayOpen()) {
    document.body.style.overflow = "auto";
  }
}


/* ------------------------------------------------------------------------
   toggleOverlay(id)
   Called from the navbar buttons.
   If the overlay is open → close.
   If closed → open.
   ------------------------------------------------------------------------ */
function toggleOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  if (overlay.classList.contains("active")) {
    closeOverlay(id);
  } else {
    openOverlay(id);
  }
}



/* ------------------------------------------------------------------------
   Helper: anyOverlayOpen()
   Returns true if any overlay is currently active.
   ------------------------------------------------------------------------ */
function anyOverlayOpen() {
  const overlays = getOverlays();
  return Object.values(overlays).some(ov => ov && ov.classList.contains("active"));
}



/* ========================================================================
   EVENT HANDLING (bound after components are injected)
   ======================================================================== */

function bindOverlayEvents() {
  /* Close overlays when clicking OUTSIDE overlay-inner */
  document.addEventListener("click", function (event) {
    const clickedInsideOverlay = event.target.closest(".overlay-inner");
    const clickedOverlay = event.target.closest(".overlay");
    if (!clickedInsideOverlay && clickedOverlay) {
      closeAllOverlays();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAllOverlays();
    }
  });

  document.querySelectorAll(".overlay-inner").forEach(inner => {
    inner.addEventListener("click", event => {
      event.stopPropagation();
    });
  });
}

/* ========================================================================
   MOBILE NAV MENU (hamburger)
   ======================================================================== */
function bindNavMenu() {
  const header = document.querySelector(".navbar.sticky");
  if (!header) return;

  const toggle = header.querySelector(".nav-toggle");
  const menu = header.querySelector("#navbar-menu");
  if (!toggle || !menu) return;

  function setOpen(nextOpen) {
    const isOpen = Boolean(nextOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menu.hidden = !isOpen;
  }

  function isMenuOpen() {
    return toggle.getAttribute("aria-expanded") === "true" && !menu.hidden;
  }

  toggle.addEventListener("click", () => {
    setOpen(!isMenuOpen());
  });

  // Close menu when clicking a link or menu item inside it
  menu.addEventListener("click", event => {
    const clickedLink = event.target.closest("a, button");
    if (clickedLink) setOpen(false);
  });

  // Close on outside click (only if open)
  document.addEventListener("click", event => {
    if (!isMenuOpen()) return;
    const clickedInside = event.target.closest(".navbar.sticky");
    if (!clickedInside) setOpen(false);
  });

  // Close on ESC (coexists with overlay ESC handler)
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setOpen(false);
  });

  // When switching to desktop, ensure menu isn't stuck open
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 769px)").matches) setOpen(false);
  });

  // Default closed
  setOpen(false);
}


/* ========================================================================
   TRANSLATION SERVICE (TEMP JSON FALLBACK)
   ------------------------------------------------------------------------
   Provides client-side translations by fetching JSON files. This mimics
   the upcoming translation API endpoint so we can swap in the network
   call later without changing markup.
   ======================================================================== */
const translationService = (() => {
  const SUPPORTED_LANGS = ["en", "hu", "de"];
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "nobelian-preferred-language";
  const TRANSLATION_BASE = "/translations";

  let currentLang = DEFAULT_LANG;
  let translations = {};

  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialLang = SUPPORTED_LANGS.includes(saved) ? saved : detectBrowserLanguage();
    bindLanguageSwitcher();
    loadLanguage(initialLang);
  }

  /**
   * Detect the user's preferred language from the browser.
   * Checks navigator.language and navigator.languages for a supported match.
   * Falls back to DEFAULT_LANG if no match is found.
   */
  function detectBrowserLanguage() {
    const candidates = navigator.languages
      ? Array.from(navigator.languages)
      : [navigator.language || ""];

    for (const lang of candidates) {
      // Check exact match first (e.g. "hu", "de")
      const code = lang.toLowerCase().split("-")[0];
      if (SUPPORTED_LANGS.includes(code)) {
        return code;
      }
    }
    return DEFAULT_LANG;
  }

  function bindLanguageSwitcher() {
    const selector = document.getElementById("language-select");
    if (!selector) return;
    selector.addEventListener("change", event => {
      loadLanguage(event.target.value);
    });
  }

  async function loadLanguage(lang) {
    const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;

    try {
      const response = await fetch(`${TRANSLATION_BASE}/${safeLang}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load ${safeLang} translations`);

      translations = await response.json();
      currentLang = safeLang;
      localStorage.setItem(STORAGE_KEY, safeLang);

      updateLanguageSwitcher();
      applyTranslations();
    } catch (error) {
      console.error("[i18n] Unable to load translations:", error);
      if (safeLang !== DEFAULT_LANG) {
        loadLanguage(DEFAULT_LANG);
      }
    }
  }

  function updateLanguageSwitcher() {
    const selector = document.getElementById("language-select");
    if (selector) {
      selector.value = currentLang;
    }
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const value = getTranslationValue(key);
      if (value) {
        el.textContent = value;
      }
    });

    applyAttributeTranslations("data-i18n-placeholder", "placeholder");
    applyAttributeTranslations("data-i18n-aria-label", "aria-label");
    applyAttributeTranslations("data-i18n-alt", "alt");
  }

  function applyAttributeTranslations(attributeName, targetAttribute) {
    document.querySelectorAll(`[${attributeName}]`).forEach(el => {
      const key = el.getAttribute(attributeName);
      const value = getTranslationValue(key);
      if (value) {
        el.setAttribute(targetAttribute, value);
      }
    });
  }

  function getTranslationValue(path) {
    if (!path) return "";
    return path.split(".").reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
        return acc[part];
      }
      return undefined;
    }, translations);
  }

  return {
    init,
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  /* Wait for navbar/footer components to be injected, then init i18n and overlay events */
  document.addEventListener("componentsLoaded", () => {
    translationService.init();
    bindOverlayEvents();
    bindNavMenu();
    initHomeBrandOverlay();
  });
});


/* ========================================================================
   HOME PAGE — BRAND OVERLAY SCROLL ANIMATION
   ------------------------------------------------------------------------
   The fixed brand logo starts large & centered over the hero video.
   As the user scrolls, it shrinks and moves up into the sticky navbar center.
   The navbar transitions from transparent to white background.
   ======================================================================== */
function initHomeBrandOverlay() {
  const overlay = document.querySelector(".home-brand-overlay");
  const logo = document.querySelector(".home-brand-logo");
  const hero = document.querySelector(".hero-section--home");
  const navbar = document.querySelector(".navbar.sticky");
  if (!overlay || !logo || !hero || !navbar) return;

  // Measurements
  const navbarHeight = navbar.offsetHeight;
  // The scroll distance over which the animation plays (first 35% of hero)
  const animationRange = hero.offsetHeight * 0.35;

  // Logo sizes
  const logoStartWidth = logo.offsetWidth; // large initial size
  const logoEndWidth = 140; // navbar logo size (px)

  // Positions: start = viewport center, end = navbar center
  const viewportCenterY = window.innerHeight / 2;
  const navbarCenterY = navbarHeight / 2;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const progress = Math.min(Math.max(scrollY / animationRange, 0), 1);

    // Scale: interpolate from 1 to (endWidth / startWidth)
    const targetScale = 1 - progress * (1 - logoEndWidth / logoStartWidth);

    // Translate Y: from center of viewport to center of navbar
    // The overlay is fixed with align-items:center, so logo is at viewportCenterY.
    // We need to move it up by (viewportCenterY - navbarCenterY) * progress
    const translateY = -(viewportCenterY - navbarCenterY) * progress;

    logo.style.transform = `translateY(${translateY}px) scale(${targetScale})`;

    // Navbar state
    if (progress >= 1) {
      navbar.classList.add("home-scrolled");
      // Switch logo filter from white glow to none when in navbar
      logo.style.filter = "none";
      logo.style.opacity = "0.9";
    } else {
      navbar.classList.remove("home-scrolled");
      logo.style.filter = "drop-shadow(0 2px 12px rgba(255,255,255,0.4))";
      logo.style.opacity = "0.92";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    // Recalculate on resize — simple approach: reload measurements not needed
    // since we use relative progress. But we can just re-run.
    onScroll();
  });
  onScroll(); // initial state
}