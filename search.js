/* ========================================================================
   SEARCH SERVICE
   ------------------------------------------------------------------------
   Handles the search overlay UI and communicates with the backend
   /api/products/search?q=... endpoint.
   ======================================================================== */

const searchService = (() => {
  const API_BASE_URL = "https://nobelian-be.fly.dev/api";
  let debounceTimer = null;

  function init() {
    const searchBtn = document.getElementById("nav-search-btn");
    const closeBtn = document.getElementById("search-close-btn");
    const searchInput = document.getElementById("search-input");
    const overlay = document.getElementById("search-overlay");

    if (!searchBtn || !overlay) return;

    // Open search overlay
    searchBtn.addEventListener("click", () => {
      openSearch();
    });

    // Close search overlay
    closeBtn.addEventListener("click", () => {
      closeSearch();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        closeSearch();
      }
    });

    // Close when clicking outside the inner area
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeSearch();
      }
    });

    // Search on input with debounce
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(searchInput.value.trim());
      }, 300);
    });

    // Search on Enter
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(debounceTimer);
        performSearch(searchInput.value.trim());
      }
    });
  }

  function openSearch() {
    const overlay = document.getElementById("search-overlay");
    const searchInput = document.getElementById("search-input");
    if (!overlay) return;

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Focus the input after a brief delay for the animation
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }

  function closeSearch() {
    const overlay = document.getElementById("search-overlay");
    const searchInput = document.getElementById("search-input");
    const resultsContainer = document.getElementById("search-results");
    if (!overlay) return;

    overlay.classList.remove("active");
    document.body.style.overflow = "";
    searchInput.value = "";
    resultsContainer.innerHTML = "";
  }

  async function performSearch(query) {
    const resultsContainer = document.getElementById("search-results");

    if (!query || query.length < 2) {
      resultsContainer.innerHTML = "";
      return;
    }

    resultsContainer.innerHTML = '<p class="search-loading">Searching...</p>';

    try {
      const res = await fetch(
        `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error("Search failed");

      const products = await res.json();
      renderResults(products, query);
    } catch (err) {
      console.error("[search] Error:", err);
      resultsContainer.innerHTML =
        '<p class="search-no-results">Something went wrong. Please try again.</p>';
    }
  }

  function renderResults(products, query) {
    const resultsContainer = document.getElementById("search-results");

    if (products.length === 0) {
      resultsContainer.innerHTML = `<p class="search-no-results">No results found for "${escapeHtml(query)}"</p>`;
      return;
    }

    const items = products
      .map((product) => {
        const image =
          product.images && product.images.length > 0
            ? product.images[0]
            : "https://assets.nobelian.com/images/products/placeholder.jpg";

        const price = new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: product.currency || "EUR",
        }).format(product.price);

        return `
        <a class="search-result-item" href="/product/?id=${product.id}">
          <img class="search-result-image" src="${image}" alt="${escapeHtml(product.name)}" loading="lazy">
          <div class="search-result-info">
            <span class="search-result-name">${escapeHtml(product.name)}</span>
            <span class="search-result-description">${escapeHtml(product.description)}</span>
            <span class="search-result-price">${price}</span>
          </div>
        </a>
      `;
      })
      .join("");

    resultsContainer.innerHTML = `<div class="search-results-grid">${items}</div>`;
  }

  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, openSearch, closeSearch };
})();

// Initialize after components are loaded
document.addEventListener("componentsLoaded", () => {
  searchService.init();
});
