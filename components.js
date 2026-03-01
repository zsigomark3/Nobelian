/* ========================================================================
   REUSABLE COMPONENTS LOADER
   Loads navbar and footer from /components/navbar.html and /components/footer.html
   and injects them into placeholders. Dispatches "componentsLoaded" when done.
   ======================================================================== */

(function () {
  const COMPONENTS = [
    { selector: '[data-component="navbar"]', src: "/components/navbar.html" },
    { selector: '[data-component="footer"]', src: "/components/footer.html" },
  ];

  function injectHtml(placeholder, html) {
    const temp = document.createElement("div");
    temp.innerHTML = html.trim();
    const parent = placeholder.parentNode;
    if (temp.children.length === 1) {
      parent.replaceChild(temp.firstElementChild, placeholder);
      return;
    }
    while (temp.firstChild) {
      parent.insertBefore(temp.firstChild, placeholder);
    }
    parent.removeChild(placeholder);
  }

  function loadComponent(placeholder, src) {
    return fetch(src)
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to load " + src);
        return r.text();
      })
      .then(function (html) {
        injectHtml(placeholder, html);
      });
  }

  function loadAll() {
    var promises = [];
    COMPONENTS.forEach(function (c) {
      var placeholders = document.querySelectorAll(c.selector);
      placeholders.forEach(function (el) {
        var src = el.getAttribute("data-src") || c.src;
        promises.push(loadComponent(el, src));
      });
    });
    return Promise.all(promises);
  }

  function init() {
    loadAll()
      .then(function () {
        document.dispatchEvent(new CustomEvent("componentsLoaded"));
      })
      .catch(function (err) {
        console.error("[components] Load failed:", err);
        document.dispatchEvent(new CustomEvent("componentsLoaded"));
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
