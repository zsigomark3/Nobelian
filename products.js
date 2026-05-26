/* ========================================================================
   PRODUCT SERVICE
   ------------------------------------------------------------------------
   Fetches products from the backend API and renders them dynamically
   into product grids on collection/category pages.
   ======================================================================== */

const productService = (() => {
  const API_BASE_URL = "https://nobelian-be.fly.dev/api";

  let allProducts = null; // cache after first fetch

  /**
   * Fetch all products from the API
   */
  async function fetchProducts() {
    if (allProducts) return allProducts;

    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    allProducts = await res.json();
    return allProducts;
  }

  /**
   * Get products filtered by category (bag, scarf, gloves, charm)
   */
  async function getByCategory(category) {
    const products = await fetchProducts();
    return products.filter(
      (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get products filtered by collection slug (fetches collection list, finds ID, then filters)
   */
  async function getByCollectionSlug(slug) {
    const products = await fetchProducts();
    // Fetch collections to find the matching ID
    const colRes = await fetch(`${API_BASE_URL}/collections`);
    if (!colRes.ok) return products; // fallback: show all
    const collections = await colRes.json();
    const collection = collections.find(
      (c) => c.slug && c.slug.toLowerCase() === slug.toLowerCase()
    );
    if (!collection) return [];
    return products.filter((p) => p.collection_id === collection.id);
  }

  /**
   * Get products filtered by collection ID
   */
  async function getByCollection(collectionId) {
    const products = await fetchProducts();
    return products.filter((p) => p.collection_id === collectionId);
  }

  /**
   * Get a single product by ID
   */
  async function getById(productId) {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!res.ok) throw new Error("Product not found");
    return res.json();
  }

  /**
   * Render a product card HTML
   */
  function renderCard(product) {
    const image = product.images && product.images.length > 0
      ? product.images[0]
      : "https://assets.nobelian.com/images/products/placeholder.jpg";

    const price = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: product.currency || "EUR",
    }).format(product.price);

    const isInStock = product.in_stock && (product.quantity === null || product.quantity === undefined || product.quantity > 0);
    const stockClass = isInStock ? "" : " out-of-stock";

    // Quantity/stock label
    let stockLabel = "";
    if (!isInStock) {
      stockLabel = '<span class="product-stock-label">Out of Stock</span>';
    } else if (product.quantity !== null && product.quantity !== undefined && product.quantity <= 5) {
      stockLabel = `<span class="product-stock-label low-stock">Only ${product.quantity} left</span>`;
    }

    const addToCartBtn = isInStock
      ? `<button class="product-add-btn" data-product-id="${product.id}" aria-label="Add ${product.name} to cart">Add to Cart</button>`
      : "";

    return `
      <article class="product-card${stockClass}" data-product-id="${product.id}">
        <img src="${image}" alt="${product.name} - ${product.description}" loading="lazy">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-subtitle">${product.description}</p>
        <p class="product-price">${price}</p>
        ${stockLabel}
        ${addToCartBtn}
      </article>
    `;
  }

  /* ====================================================================
     PRODUCT VIEW MODAL (Quick View)
     ==================================================================== */

  let modalElement = null;

  /**
   * Create the modal DOM element (once)
   */
  function ensureModal() {
    if (modalElement) return modalElement;

    const backdrop = document.createElement("div");
    backdrop.className = "product-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", "Product details");
    backdrop.innerHTML = `
      <div class="product-modal">
        <button class="product-modal-close" aria-label="Close">&times;</button>
        <img class="product-modal-image" src="" alt="">
        <div class="product-modal-info">
          <h2 class="product-modal-name"></h2>
          <p class="product-modal-description"></p>
          <p class="product-modal-price"></p>
          <div class="product-modal-quantity">
            <button class="product-modal-qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
            <span class="product-modal-qty-value">1</span>
            <button class="product-modal-qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
          <button class="product-modal-add-btn">Add to Cart</button>
          <a class="product-modal-details-link" href="#">View Full Details →</a>
        </div>
      </div>
    `;
    document.body.appendChild(backdrop);
    modalElement = backdrop;

    // Close handlers
    backdrop.querySelector(".product-modal-close").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalElement.classList.contains("active")) closeModal();
    });

    // Quantity controls
    backdrop.querySelectorAll(".product-modal-qty-btn").forEach((btn) => {
      btn.addEventListener("click", handleQuantityChange);
    });

    // Add to cart from modal
    backdrop.querySelector(".product-modal-add-btn").addEventListener("click", handleModalAddToCart);

    return modalElement;
  }

  /**
   * Handle quantity +/- button clicks in the modal
   */
  function handleQuantityChange(event) {
    const action = event.currentTarget.dataset.action;
    const qtyEl = modalElement.querySelector(".product-modal-qty-value");
    let current = parseInt(qtyEl.textContent, 10) || 1;

    if (action === "increase" && current < 9) {
      current++;
    } else if (action === "decrease" && current > 1) {
      current--;
    }

    qtyEl.textContent = current;
  }

  /**
   * Open the product view modal
   */
  function openModal(product) {
    const modal = ensureModal();

    const image = product.images && product.images.length > 0
      ? product.images[0]
      : "https://assets.nobelian.com/images/products/placeholder.jpg";

    // Format price: if product.price is a number, format it; otherwise use raw string
    let priceDisplay;
    if (typeof product.price === "number" && product.price > 0) {
      priceDisplay = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: product.currency || "EUR",
      }).format(product.price);
    } else if (product.priceText) {
      priceDisplay = product.priceText;
    } else {
      priceDisplay = "";
    }

    modal.querySelector(".product-modal-image").src = image;
    modal.querySelector(".product-modal-image").alt = product.name;
    modal.querySelector(".product-modal-name").textContent = product.name;
    modal.querySelector(".product-modal-description").textContent = product.description || "";
    modal.querySelector(".product-modal-price").textContent = priceDisplay;

    const addBtn = modal.querySelector(".product-modal-add-btn");
    const qtyContainer = modal.querySelector(".product-modal-quantity");
    const qtyValue = modal.querySelector(".product-modal-qty-value");
    addBtn.dataset.productId = product.id || "";
    qtyValue.textContent = "1";

    // Show quantity + add button if product is in stock (or stock status unknown) and has an ID
    const isInStock = product.in_stock !== false;
    if (isInStock && product.id) {
      addBtn.disabled = false;
      addBtn.textContent = "Add to Cart";
      addBtn.style.display = "";
      qtyContainer.style.display = "";
    } else if (!product.id) {
      // Static fallback card without product ID — hide cart controls
      addBtn.style.display = "none";
      qtyContainer.style.display = "none";
    } else {
      // Out of stock
      addBtn.style.display = "none";
      qtyContainer.style.display = "none";
    }

    // Update "View Details" link
    const detailsLink = modal.querySelector(".product-modal-details-link");
    if (product.id) {
      detailsLink.href = `/product/?id=${product.id}`;
      detailsLink.style.display = "";
    } else {
      detailsLink.style.display = "none";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  /**
   * Close the product view modal
   */
  function closeModal() {
    if (!modalElement) return;
    modalElement.classList.remove("active");
    document.body.style.overflow = "";
  }

  /**
   * Handle "Add to Cart" from the modal
   */
  async function handleModalAddToCart(event) {
    const btn = event.currentTarget;
    const productId = btn.dataset.productId;
    const qtyEl = modalElement.querySelector(".product-modal-qty-value");
    const quantity = parseInt(qtyEl.textContent, 10) || 1;

    if (!authService.isAuthenticated()) {
      closeModal();
      window.location.href = "/login/";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Adding...";

    try {
      await cartService.addItem(productId, quantity);
      btn.textContent = "Added ✓";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 1500);
    } catch (err) {
      btn.textContent = "Error";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 2000);
    }
  }

  /**
   * Render products into a grid container
   * @param {HTMLElement} container — the .product-grid element
   * @param {Array} products — array of ProductResponse objects
   */
  function renderGrid(container, products) {
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = '<p class="product-grid-empty">No products available yet. Check back soon.</p>';
      return;
    }

    container.innerHTML = products.map(renderCard).join("");

    // Bind "Add to Cart" buttons
    container.querySelectorAll(".product-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleAddToCart(e);
      });
    });

    // Bind product card clicks to open modal
    container.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        // Don't open modal if clicking the Add to Cart button
        if (e.target.closest(".product-add-btn")) return;
        const productId = card.dataset.productId;
        const product = products.find((p) => p.id === productId);
        if (product) openModal(product);
      });
    });
  }

  /**
   * Handle "Add to Cart" button click
   */
  async function handleAddToCart(event) {
    const btn = event.currentTarget;
    const productId = btn.dataset.productId;

    if (!authService.isAuthenticated()) {
      window.location.href = "/login/";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Adding...";

    try {
      await cartService.addItem(productId);
      btn.textContent = "Added ✓";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 1500);
    } catch (err) {
      btn.textContent = "Error";
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 2000);
    }
  }

  /**
   * Auto-initialize: detect page type and load products
   */
  async function init() {
    const page = document.body.dataset.page;
    const grid = document.querySelector(".product-grid");

    if (!grid) return; // No product grid on this page

    const categoryPages = ["bag", "scarf", "gloves", "charm"];
    const collectionPages = { artcollection: "art-collection", basiccollection: "basic-collection" };

    try {
      let products;
      if (categoryPages.includes(page)) {
        products = await getByCategory(page);
      } else if (collectionPages[page]) {
        products = await getByCollectionSlug(collectionPages[page]);
      } else {
        products = await fetchProducts();
      }

      // Only replace grid content if we got products from the API
      if (products && products.length > 0) {
        renderGrid(grid, products);
      } else {
        // Fallback: bind click handlers on existing static cards
        bindStaticCards(grid);
      }
    } catch (err) {
      console.error("[products] Failed to load products:", err);
      // Keep existing static content as fallback, but still bind clicks
      bindStaticCards(grid);
    }
  }

  /**
   * Bind click handlers on static (server-rendered) product cards.
   * Extracts visible data from the DOM to populate the quick view modal.
   */
  function bindStaticCards(container) {
    const cards = container.querySelectorAll(".product-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".product-add-btn")) return;

        const img = card.querySelector("img");
        const name = card.querySelector(".product-name");
        const subtitle = card.querySelector(".product-subtitle");
        const price = card.querySelector(".product-price");

        // Build a minimal product object from static DOM content
        const staticProduct = {
          id: card.dataset.productId || null,
          name: name ? name.textContent : "",
          description: subtitle ? subtitle.textContent : "",
          price: 0,
          priceText: price ? price.textContent : "",
          currency: "EUR",
          images: img ? [img.src] : [],
          in_stock: !card.classList.contains("out-of-stock"),
        };

        openModal(staticProduct);
      });
    });
  }

  return {
    fetchProducts,
    getByCategory,
    getByCollection,
    getById,
    renderGrid,
    init,
  };
})();

// Initialize after components are loaded
document.addEventListener("componentsLoaded", () => {
  productService.init();
});
