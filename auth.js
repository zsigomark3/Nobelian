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
   * Update UI based on authentication state — account panel version
   */
  function updateUI() {
    const user = getUser();
    const tabs = document.getElementById("account-panel-tabs");
    const loginTab = document.getElementById("account-tab-login");
    const registerTab = document.getElementById("account-tab-register");
    const loggedInPanel = document.getElementById("account-panel-logged-in");

    if (!tabs) return; // panel not yet in DOM

    if (user) {
      // User is logged in — hide tabs & forms, show logged-in nav
      tabs.style.display = "none";
      if (loginTab) loginTab.classList.remove("active");
      if (registerTab) registerTab.classList.remove("active");
      if (loggedInPanel) {
        loggedInPanel.style.display = "block";
        loggedInPanel.classList.add("active");
      }
    } else {
      // User is not logged in — show tabs & login form
      tabs.style.display = "flex";
      if (loggedInPanel) {
        loggedInPanel.style.display = "none";
        loggedInPanel.classList.remove("active");
      }
      switchAccountTab("login");
    }
  }

  /**
   * Initialize authentication service
   */
  function init() {
    updateUI();
    bindPanelForms();
  }

  /**
   * Bind panel form submissions
   */
  function bindPanelForms() {
    const loginForm = document.getElementById("panel-login-form");
    const registerForm = document.getElementById("panel-register-form");

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("panel-login-email").value.trim();
        const password = document.getElementById("panel-login-password").value;
        const btn = document.getElementById("panel-login-btn");
        const errorDiv = document.getElementById("panel-login-error");
        const successDiv = document.getElementById("panel-login-success");

        errorDiv.classList.remove("show");
        successDiv.classList.remove("show");
        btn.disabled = true;
        btn.textContent = "Logging in...";

        const result = await login(email, password);
        if (result.success) {
          successDiv.textContent = "Login successful!";
          successDiv.classList.add("show");
          setTimeout(() => closeAccountPanel(), 800);
        } else {
          errorDiv.textContent = result.error || "Login failed. Please try again.";
          errorDiv.classList.add("show");
        }
        btn.disabled = false;
        btn.textContent = "Login";
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("panel-register-username").value.trim();
        const email = document.getElementById("panel-register-email").value.trim();
        const password = document.getElementById("panel-register-password").value;
        const confirmPassword = document.getElementById("panel-register-confirm").value;
        const btn = document.getElementById("panel-register-btn");
        const errorDiv = document.getElementById("panel-register-error");
        const successDiv = document.getElementById("panel-register-success");

        errorDiv.classList.remove("show");
        successDiv.classList.remove("show");

        if (password !== confirmPassword) {
          errorDiv.textContent = "Passwords do not match.";
          errorDiv.classList.add("show");
          return;
        }
        if (password.length < 8) {
          errorDiv.textContent = "Password must be at least 8 characters.";
          errorDiv.classList.add("show");
          return;
        }

        btn.disabled = true;
        btn.textContent = "Registering...";

        const result = await register(username, email, password);
        if (result.success) {
          successDiv.textContent = "Registration successful!";
          successDiv.classList.add("show");
          setTimeout(() => closeAccountPanel(), 800);
        } else {
          errorDiv.textContent = result.error || "Registration failed. Please try again.";
          errorDiv.classList.add("show");
        }
        btn.disabled = false;
        btn.textContent = "Register";
      });
    }
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

/* ========================================================================
   ACCOUNT PANEL — TOGGLE / TAB SWITCHING
   ======================================================================== */

function toggleAccountPanel() {
  const panel = document.getElementById("account-panel");
  const overlay = document.getElementById("account-panel-overlay");
  if (!panel) return;

  const isOpen = panel.classList.contains("active");
  if (isOpen) {
    closeAccountPanel();
  } else {
    panel.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeAccountPanel() {
  const panel = document.getElementById("account-panel");
  const overlay = document.getElementById("account-panel-overlay");
  if (panel) panel.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

function switchAccountTab(tab) {
  const tabs = document.querySelectorAll(".account-tab");
  const contents = document.querySelectorAll(".account-tab-content");

  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  contents.forEach((c) => {
    if (c.id === `account-tab-${tab}`) {
      c.classList.add("active");
    } else if (c.id !== "account-panel-logged-in") {
      c.classList.remove("active");
    }
  });
}

// Close panel on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAccountPanel();
});

// Initialize when navbar/footer components are loaded (so account panel exists)
document.addEventListener("componentsLoaded", () => {
  authService.init();
});
