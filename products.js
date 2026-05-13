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

    const stockClass = product.in_stock ? "" : " out-of-stock";
    const stockLabel = product.in_stock ? "" : '<span class="product-stock-label">Out of Stock</span>';
    const addToCartBtn = product.in_stock
      ? `<button class="product-add-btn" data-product-id="${product.id}" aria-label="Add ${product.name} to cart">Add to Cart</button>`
      : "";

    return `
      <article class="product-card${stockClass}">
        <img src="${image}" alt="${product.name} - ${product.description}" loading="lazy">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-subtitle">${product.description}</p>
        <p class="product-price">${price}</p>
        ${stockLabel}
        ${addToCartBtn}
      </article>
    `;
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
      btn.addEventListener("click", handleAddToCart);
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
      }
    } catch (err) {
      console.error("[products] Failed to load products:", err);
      // Keep existing static content as fallback
    }
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
