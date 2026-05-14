/* ========================================================================
   COOKIE CONSENT CONFIGURATION
   ------------------------------------------------------------------------
   Uses CookieConsent v3 by Orest Bida (MIT License)
   https://github.com/orestbida/cookieconsent
   
   Categories:
   - necessary: always enabled (session, CSRF, language preference)
   - analytics: Google Tag Manager, Google Analytics
   - marketing: Facebook Pixel, retargeting (future use)
   ======================================================================== */

/**
 * Initialise CookieConsent after DOM + components are ready.
 */
function initCookieConsent() {
  if (typeof CookieConsent === 'undefined') return;

  CookieConsent.run({
    cookie: {
      name: 'cc_cookie',
      expiresAfterDays: 182, // 6 months — GDPR recommends max 12 months
    },

    guiOptions: {
      consentModal: {
        layout: 'box',
        position: 'bottom left',
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: {
        layout: 'box',
        position: 'right',
        equalWeightButtons: true,
        flipButtons: false,
      },
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        enabled: false,
        autoClear: {
          cookies: [
            { name: /^_ga/ },
            { name: '_gid' },
            { name: /^_gat/ },
          ],
        },
      },
      marketing: {
        enabled: false,
        autoClear: {
          cookies: [
            { name: '_fbp' },
            { name: '_fbc' },
          ],
        },
      },
    },

    onFirstConsent: ({ cookie }) => {
      handleConsentChange(cookie.categories);
    },
    onConsent: ({ cookie }) => {
      handleConsentChange(cookie.categories);
    },
    onChange: ({ cookie }) => {
      handleConsentChange(cookie.categories);
    },

    language: {
      default: getInitialLanguage(),
      autoDetect: 'document',
      translations: {
        en: {
          consentModal: {
            title: 'We use cookies',
            description:
              'We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. You can choose which categories to allow. Read our <a href="/cookie-policy/">Cookie Policy</a> for more details.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            showPreferencesBtn: 'Manage preferences',
          },
          preferencesModal: {
            title: 'Cookie Preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            savePreferencesBtn: 'Save preferences',
            closeIconLabel: 'Close',
            sections: [
              {
                title: 'Cookie Usage',
                description:
                  'We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose to opt in or out of each category whenever you want.',
              },
              {
                title: 'Strictly Necessary Cookies',
                description:
                  'These cookies are essential for the website to function properly. They enable basic features like page navigation, secure access, and language preferences.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analytics Cookies',
                description:
                  'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
                linkedCategory: 'analytics',
              },
              {
                title: 'Marketing Cookies',
                description:
                  'These cookies are used to deliver advertisements that are relevant to you. They also help measure the effectiveness of advertising campaigns.',
                linkedCategory: 'marketing',
              },
              {
                title: 'More Information',
                description:
                  'For any questions regarding our cookie policy, please <a href="/contact/">contact us</a>.',
              },
            ],
          },
        },
        hu: {
          consentModal: {
            title: 'Cookie-kat használunk',
            description:
              'Cookie-kat használunk a böngészési élmény javítására, személyre szabott tartalom megjelenítésére és a forgalom elemzésére. Kiválaszthatod, mely kategóriákat engedélyezed. Részletekért olvasd el a <a href="/cookie-policy/">Cookie szabályzatunkat</a>.',
            acceptAllBtn: 'Összes elfogadása',
            acceptNecessaryBtn: 'Összes elutasítása',
            showPreferencesBtn: 'Beállítások kezelése',
          },
          preferencesModal: {
            title: 'Cookie beállítások',
            acceptAllBtn: 'Összes elfogadása',
            acceptNecessaryBtn: 'Összes elutasítása',
            savePreferencesBtn: 'Beállítások mentése',
            closeIconLabel: 'Bezárás',
            sections: [
              {
                title: 'Cookie használat',
                description:
                  'Cookie-kat használunk a weboldal alapvető működésének biztosítására és az online élmény javítására. Bármikor választhatsz az egyes kategóriák között.',
              },
              {
                title: 'Feltétlenül szükséges cookie-k',
                description:
                  'Ezek a cookie-k elengedhetetlenek a weboldal megfelelő működéséhez. Alapvető funkciókat biztosítanak, mint az oldalnavigáció, biztonságos hozzáférés és nyelvi beállítások.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analitikai cookie-k',
                description:
                  'Ezek a cookie-k segítenek megérteni, hogyan használják a látogatók a weboldalunkat, anonim adatgyűjtéssel és jelentéskészítéssel.',
                linkedCategory: 'analytics',
              },
              {
                title: 'Marketing cookie-k',
                description:
                  'Ezek a cookie-k releváns hirdetések megjelenítésére szolgálnak. Segítenek mérni a hirdetési kampányok hatékonyságát is.',
                linkedCategory: 'marketing',
              },
              {
                title: 'További információ',
                description:
                  'Cookie szabályzatunkkal kapcsolatos kérdésekkel kérjük, <a href="/contact/">lépj velünk kapcsolatba</a>.',
              },
            ],
          },
        },
        de: {
          consentModal: {
            title: 'Wir verwenden Cookies',
            description:
              'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Inhalte bereitzustellen und unseren Datenverkehr zu analysieren. Sie können wählen, welche Kategorien Sie zulassen möchten. Lesen Sie unsere <a href="/cookie-policy/">Cookie-Richtlinie</a> für weitere Details.',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            showPreferencesBtn: 'Einstellungen verwalten',
          },
          preferencesModal: {
            title: 'Cookie-Einstellungen',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            savePreferencesBtn: 'Einstellungen speichern',
            closeIconLabel: 'Schließen',
            sections: [
              {
                title: 'Cookie-Nutzung',
                description:
                  'Wir verwenden Cookies, um die grundlegenden Funktionen der Website sicherzustellen und Ihr Online-Erlebnis zu verbessern. Sie können jederzeit wählen, welche Kategorien Sie aktivieren möchten.',
              },
              {
                title: 'Unbedingt erforderliche Cookies',
                description:
                  'Diese Cookies sind für das ordnungsgemäße Funktionieren der Website unerlässlich. Sie ermöglichen grundlegende Funktionen wie Seitennavigation, sicheren Zugang und Spracheinstellungen.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analyse-Cookies',
                description:
                  'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie anonym Informationen sammeln und melden.',
                linkedCategory: 'analytics',
              },
              {
                title: 'Marketing-Cookies',
                description:
                  'Diese Cookies werden verwendet, um Ihnen relevante Werbung zu liefern. Sie helfen auch, die Wirksamkeit von Werbekampagnen zu messen.',
                linkedCategory: 'marketing',
              },
              {
                title: 'Weitere Informationen',
                description:
                  'Bei Fragen zu unserer Cookie-Richtlinie <a href="/contact/">kontaktieren Sie uns</a> bitte.',
              },
            ],
          },
        },
      },
    },
  });
}

function getInitialLanguage() {
  const saved = localStorage.getItem('nobelian-preferred-language');
  const supported = ['en', 'hu', 'de'];
  if (supported.includes(saved)) return saved;

  // Detect from browser language
  const candidates = navigator.languages
    ? Array.from(navigator.languages)
    : [navigator.language || ''];
  for (const lang of candidates) {
    const code = lang.toLowerCase().split('-')[0];
    if (supported.includes(code)) return code;
  }
  return 'en';
}

function handleConsentChange(acceptedCategories) {
  if (acceptedCategories.includes('analytics')) {
    loadGTM();
  }
}

function loadGTM() {
  if (window._gtmLoaded) return;
  window._gtmLoaded = true;

  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-MLRJ5PNR');
}

// Self-initialise: run CookieConsent as soon as this script loads
// (loaded after app.js via defer, so DOM and components are ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCookieConsent);
} else {
  initCookieConsent();
}
