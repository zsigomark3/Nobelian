/* ========================================================================
   CART SERVICE
   ------------------------------------------------------------------------
   Handles cart state, API communication, and cart UI badge updates.
   Requires auth.js to be loaded first for token management.
   ======================================================================== */

const cartService = (() => {
  const API_BASE_URL = "https://nobelian-be.fly.dev/api";

  /**
   * Get auth headers from authService
   */
  function headers() {
    const token = authService.getToken();
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  /**
   * Fetch the current user's cart
   */
  async function getCart() {
    const res = await fetch(`${API_BASE_URL}/cart`, { headers: headers() });
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
  }

  /**
   * Add a product to the cart
   * @param {string} productId
   * @param {number} [quantity=1]
   */
  async function addItem(productId, quantity = 1) {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to add item to cart");
    }
    const cart = await res.json();
    updateBadge(cart);
    return cart;
  }

  /**
   * Update item quantity
   * @param {string} productId
   * @param {number} quantity — set to 0 to remove
   */
  async function updateItem(productId, quantity) {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart item");
    const cart = await res.json();
    updateBadge(cart);
    return cart;
  }

  /**
   * Remove an item from the cart
   * @param {string} productId
   */
  async function removeItem(productId) {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "DELETE",
      headers: headers(),
      body: JSON.stringify({ product_id: productId }),
    });
    if (!res.ok) throw new Error("Failed to remove item from cart");
    const cart = await res.json();
    updateBadge(cart);
    return cart;
  }

  /**
   * Clear the entire cart
   */
  async function clearCart() {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to clear cart");
    updateBadge({ items: [] });
    return res.json();
  }

  /**
   * Update the cart badge count in the navbar
   */
  function updateBadge(cart) {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    const count = cart && cart.items
      ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }

  /**
   * Initialize cart badge on page load (if user is authenticated)
   */
  async function init() {
    if (!authService.isAuthenticated()) {
      updateBadge({ items: [] });
      return;
    }
    try {
      const cart = await getCart();
      updateBadge(cart);
    } catch (e) {
      // Silently fail — badge stays hidden
      updateBadge({ items: [] });
    }
  }

  return {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    updateBadge,
    init,
  };
})();

// Initialize after components are loaded
document.addEventListener("componentsLoaded", () => {
  cartService.init();
});
