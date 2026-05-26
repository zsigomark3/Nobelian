# Nobelian

Production-grade multilingual e-commerce platform built with a custom
HTML/CSS/JavaScript frontend and Rust (Actix Web) backend.

This project is actively maintained and used in a live environment.

---

## 🌍 Overview

This webshop is a full-featured, multilingual e-commerce platform
designed for performance, SEO optimization and scalable backend architecture.

Primary goals:
- High performance
- Clean SEO structure
- Secure backend implementation
- Multilanguage support
- Maintainable architecture

### Key Features

- **Product catalog** — Collection pages (Bag, Scarf, Gloves, Charm, Art/Basic Collection)
- **Shopping cart** — Add/remove items, quantity management
- **Checkout & Payment** — Multi-step checkout with bank transfer, card (Stripe), and COD options
- **User accounts** — Registration, login, JWT-based authentication
- **User profile** — Profile editing (name, phone), saved shipping address, password change
- **Order management** — Order history and tracking
- **Multilingual** — EN, DE, HU with dynamic content switching
- **Responsive design** — Mobile-first, custom CSS (no framework)
- **SEO optimized** — Structured data, meta tags, canonical URLs
- **Cookie consent** — GDPR-compliant cookie banner (CookieConsent v3)

---

## 🛠 Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Structured semantic markup
- SEO optimized rendering
- Google Tag Manager integration

### Backend
- Rust
- Actix Web framework
- RESTful architecture
- Middleware-based request handling

### Database
- MongoDB
- Indexed collections for product search
- Optimized query structure

---

## 🌐 Multilanguage Support

Default language: English (EN)

Supported languages:
- EN
- DE
- HU

Language handling:
- Route-based language prefixes
- SEO-friendly localized URLs
- Dynamic content rendering based on locale
- Fallback to default language

---

## ⚡ Performance & SEO

- Server-side rendered content
- Clean semantic HTML
- Optimized meta tags per language
- Structured data markup
- Canonical URL handling
- Google Tag Manager integration
- Performance-optimized asset loading
- Indexed MongoDB queries

---

## 🏗 Architecture

The application follows a clear separation of concerns:

- Frontend rendering layer
- Backend API layer
- Database layer
- Localization module
- SEO handling module

Backend built with Rust Actix ensures:
- High concurrency
- Low memory footprint
- Safe error handling
- Type safety

---

## 🔐 Security Considerations

- Input validation
- Sanitized database queries
- Secure environment configuration
- Rate limiting
- Structured error handling

Sensitive configuration values are handled via environment variables
and are not part of the repository.

---

## 📊 Analytics

Google Tag Manager is integrated for:
- Conversion tracking
- Event tracking
- Marketing integrations

Tracking implementation follows privacy-conscious design principles.

---

## 📂 Project Structure

High-level structure:

```
/                    # Root — index.html (home page)
/bag/                # Bag collection page
/scarf/              # Scarf collection page
/gloves/             # Gloves page
/charm/              # Charm page
/artcollection/      # Art Collection page
/basiccollection/    # Basic Collection page
/product/            # Single product page
/cart/               # Shopping cart
/checkout/           # Checkout (shipping address form)
/payment/            # Payment method selection
/orders/             # Order history
/profile/            # User profile (edit name, phone, address, password)
/login/              # Login page
/register/           # Registration page
/contact/            # Contact form
/stories/about/      # About page
/stories/material/   # Material page
/shipping/           # Shipping info
/returns/            # Returns policy
/cookie-policy/      # Cookie policy
/components/         # Reusable HTML components (navbar, footer)
/translations/       # i18n JSON files (en, de, hu)
*.js                 # Shared JS modules (app, auth, cart, search, components)
style.css            # Global stylesheet
```

---

## 🚀 Production Environment

- Designed for deployment behind reverse proxy
- Suitable for containerization
- Environment-based configuration
- Optimized for scalability

---

## 📈 Long-Term Maintainability

- Clear module separation
- Explicit routing logic
- Consistent naming conventions
- Scalable multilingual design
- Database indexing strategy

---

## 📄 License

Private project.
All rights reserved.
