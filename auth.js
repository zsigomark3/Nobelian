/* ========================================================================
   AUTHENTICATION SERVICE
   ------------------------------------------------------------------------
   Handles user registration, login, token management, and authentication
   state. Communicates with the backend API.
   ======================================================================== */

const authService = (() => {
  // Backend API (Fly.io). For local dev use: "http://localhost:8080/api"
  const API_BASE_URL = "https://nobelian-be.fly.dev/api";
  const TOKEN_KEY = "nobelian-auth-token";
  const USER_KEY = "nobelian-user";

  /**
   * Get stored authentication token
   */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  function getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Check if user is authenticated
   */
  function isAuthenticated() {
    return !!getToken();
  }

  /**
   * Store authentication data
   */
  function setAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    updateUI();
  }

  /**
   * Clear authentication data
   */
  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateUI();
  }

  /**
   * Register a new user
   */
  async function register(username, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      setAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login user
   */
  async function login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Login failed");
      }

      setAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  function logout() {
    clearAuth();
    // Redirect to home page
    if (window.location.pathname !== "/" && !window.location.pathname.endsWith("index.html")) {
      window.location.href = "/";
    }
  }

  /**
   * Get authorization header for API requests
   */
  function getAuthHeader() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Update UI based on authentication state
   */
  function updateUI() {
    const user = getUser();
    const accountBtn = document.querySelector(".nav-btn[data-i18n='common.nav.myAccount']");
    const dropdown = document.querySelector(".dropdown-content");

    if (accountBtn && dropdown) {
      if (user) {
        // User is logged in
        accountBtn.textContent = user.username || "My Account";
        dropdown.innerHTML = `
          <a href="/orders/" data-i18n="common.nav.orders">My Orders</a>
          <a href="#" onclick="authService.logout(); return false;" data-i18n="common.nav.logout">Logout</a>
        `;
      } else {
        // User is not logged in
        accountBtn.textContent = "My Account";
        dropdown.innerHTML = `
          <a href="/login/" data-i18n="common.nav.login">Login</a>
          <a href="/register/" data-i18n="common.nav.register">Register</a>
        `;
      }
    }
  }

  /**
   * Initialize authentication service
   */
  function init() {
    updateUI();
  }

  return {
    register,
    login,
    logout,
    getToken,
    getUser,
    isAuthenticated,
    getAuthHeader,
    init,
  };
})();

// Initialize when navbar/footer components are loaded (so account dropdown exists)
document.addEventListener("componentsLoaded", () => {
  authService.init();
});
