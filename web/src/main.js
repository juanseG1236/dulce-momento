const CART_KEY = "dulce-momento-cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showToast(`♡ ${product.name} añadido`);
}

export function cartCount() {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

export function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;
  const n = cartCount();
  badge.textContent = String(n);
  badge.hidden = n === 0;
}

export function showToast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 2200);
}

export function initCartButtons() {
  document.querySelectorAll("[data-add-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price || 0),
      });
    });
  });

  document.querySelectorAll("[data-cart-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        showToast("Tu carrito está vacío");
        return;
      }
      const summary = cart.map((i) => `${i.qty}× ${i.name}`).join(", ");
      showToast(`Carrito: ${summary}`);
    });
  });

  updateCartBadge();
}

export function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const drawer = document.querySelector("[data-mobile-nav]");
  if (!toggle || !drawer) return;

  const close = () => {
    drawer.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer || e.target.closest("a")) close();
  });
}

export function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  const success = form.querySelector("[data-form-success]");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("nombre") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("mensaje") || "").trim();

    if (!name || !email || !message) {
      showToast("Completa nombre, email y mensaje");
      return;
    }

    if (success) success.classList.add("show");
    form.reset();
    showToast("✦ Mensaje enviado. ¡Gracias!");
  });
}

export function initMenuFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
      });
    });
  });
}

export function boot() {
  initMobileNav();
  initCartButtons();
  initContactForm();
  initMenuFilters();
}
