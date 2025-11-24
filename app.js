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
   Cache overlay elements
   ------------------------------------------------------------------------ */
const overlays = {
  shop: document.getElementById("shop-overlay"),
  stories: document.getElementById("stories-overlay"),
};


/* ------------------------------------------------------------------------
   openOverlay(id)
   Opens the overlay with fade-in animation.
   Also ensures all other overlays close.
   ------------------------------------------------------------------------ */
function openOverlay(id) {
  const overlay = document.getElementById(id);

  // Close all other overlays
  closeAllOverlays(id);

  // If already open → do nothing
  if (overlay.classList.contains("active")) return;

  // Show overlay using CSS class
  overlay.classList.add("active");

  // Prevent page from scrolling in background
  document.body.style.overflow = "hidden";
}


/* ------------------------------------------------------------------------
   closeOverlay(id)
   Closes a specific overlay.
   ------------------------------------------------------------------------ */
function closeOverlay(id) {
  const overlay = document.getElementById(id);

  overlay.classList.remove("active");

  // Allow scrolling again if no overlays are open
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
  Object.values(overlays).forEach(overlay => {
    if (overlay.id !== except) {
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
  return Object.values(overlays).some(ov => ov.classList.contains("active"));
}



/* ========================================================================
   EVENT HANDLING
   ======================================================================== */


/* ------------------------------------------------------------------------
   Close overlays when clicking OUTSIDE overlay-inner
   (but not when clicking on the overlay content)
   ------------------------------------------------------------------------ */
document.addEventListener("click", function (event) {
  const clickedInsideOverlay = event.target.closest(".overlay-inner");
  const clickedOverlay = event.target.closest(".overlay");

  // If click happened outside overlays → close all
  if (!clickedInsideOverlay && clickedOverlay) {
    closeAllOverlays();
  }
});


/* ------------------------------------------------------------------------
   Close overlays with ESC key
   ------------------------------------------------------------------------ */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeAllOverlays();
  }
});


/* ------------------------------------------------------------------------
   Prevent closing overlay when clicking inside the content
   (Stops propagation from inside elements)
   ------------------------------------------------------------------------ */
document.querySelectorAll(".overlay-inner").forEach(inner => {
  inner.addEventListener("click", event => {
    event.stopPropagation();
  });
});


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
    const initialLang = SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
    bindLanguageSwitcher();
    loadLanguage(initialLang);
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
  translationService.init();
});