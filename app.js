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

