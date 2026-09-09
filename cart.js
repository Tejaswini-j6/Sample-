(() => {
  const STORAGE_KEY = "ratnacure_cart";
  const WA_NUMBER = "917351529769";

  const badge = document.getElementById("cartBadge");
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  const itemsEl = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const footerEl = document.getElementById("cartFooter");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  const toastEl = document.getElementById("cartToast");
  const openBtn = document.getElementById("cartOpenBtn");
  const closeBtn = document.getElementById("cartCloseBtn");
  const clearBtn = document.getElementById("cartClearBtn");

  const checkoutOverlay = document.getElementById("checkoutOverlay");
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutCloseBtn = document.getElementById("checkoutCloseBtn");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutSummary = document.getElementById("checkoutSummary");
  const checkoutTotal = document.getElementById("checkoutTotal");

  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const searchBtn = document.getElementById("searchBtn");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchCloseBtn = document.getElementById("searchCloseBtn");
  const productsGrid = document.getElementById("productsGrid");
  const prodPrev = document.getElementById("prodPrev");
  const prodNext = document.getElementById("prodNext");

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatPrice(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }

  function cartCount(cart) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }

  function updateBadge(cart) {
    if (!badge) return;
    const count = cartCount(cart);
    badge.textContent = String(count);
    badge.classList.toggle("is-empty", count === 0);
  }

  function renderCart() {
    const cart = loadCart();
    updateBadge(cart);

    if (!itemsEl || !emptyEl || !footerEl || !totalEl) return;

    itemsEl.querySelectorAll(".cart-item").forEach((row) => row.remove());

    if (!cart.length) {
      emptyEl.hidden = false;
      footerEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    footerEl.hidden = false;
    totalEl.textContent = formatPrice(cartTotal(cart));

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.dataset.id = item.id;
      row.innerHTML = `
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
          <div class="cart-item-controls">
            <button type="button" class="qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.qty}</span>
            <button type="button" class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
            <button type="button" class="cart-remove-btn" data-action="remove">Remove</button>
          </div>
        </div>
        <strong class="cart-item-line">${formatPrice(item.price * item.qty)}</strong>
      `;
      itemsEl.appendChild(row);
    });
  }

  function addToCart(product) {
    const cart = loadCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveCart(cart);
    renderCart();
    showToast(`${product.name} added to cart`);
  }

  function changeQty(id, delta) {
    let cart = loadCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((entry) => entry.id !== id);
    saveCart(cart);
    renderCart();
    if (checkoutModal?.classList.contains("is-open")) fillCheckoutSummary();
  }

  function removeItem(id) {
    saveCart(loadCart().filter((entry) => entry.id !== id));
    renderCart();
    showToast("Item removed");
    if (checkoutModal?.classList.contains("is-open")) {
      if (!loadCart().length) closeCheckout();
      else fillCheckoutSummary();
    }
  }

  function clearCart() {
    saveCart([]);
    renderCart();
    showToast("Cart cleared");
    closeCheckout();
  }

  function openCart() {
    closeMenu();
    closeSearch();
    if (!drawer || !overlay) return;
    drawer.classList.add("is-open");
    overlay.hidden = false;
    overlay.classList.add("is-visible");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
  }

  function closeCart() {
    if (!drawer || !overlay) return;
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    overlay.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
  }

  function fillCheckoutSummary() {
    const cart = loadCart();
    if (!checkoutSummary || !checkoutTotal) return;
    checkoutSummary.innerHTML = cart
      .map(
        (item) => `
      <div class="checkout-line">
        <span>${item.name} × ${item.qty}</span>
        <strong>${formatPrice(item.price * item.qty)}</strong>
      </div>`
      )
      .join("");
    checkoutTotal.textContent = formatPrice(cartTotal(cart));
  }

  function openCheckout() {
    const cart = loadCart();
    if (!cart.length) {
      showToast("Your cart is empty");
      return;
    }
    closeCart();
    fillCheckoutSummary();
    checkoutOverlay.hidden = false;
    checkoutOverlay.classList.add("is-visible");
    checkoutModal.classList.add("is-open");
    checkoutModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
    document.getElementById("checkoutName")?.focus();
  }

  function closeCheckout() {
    checkoutOverlay?.classList.remove("is-visible");
    if (checkoutOverlay) checkoutOverlay.hidden = true;
    checkoutModal?.classList.remove("is-open");
    checkoutModal?.setAttribute("aria-hidden", "true");
    if (!drawer?.classList.contains("is-open")) {
      document.body.classList.remove("cart-open");
    }
  }

  function buildWhatsAppOrder(details) {
    const cart = loadCart();
    const lines = cart.map(
      (item) => `• ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}`
    );
    return [
      "🛒 *New Ratnacure Order*",
      "",
      "*Customer*",
      `Name: ${details.name}`,
      `Phone: ${details.phone}`,
      `Address: ${details.address}`,
      details.notes ? `Notes: ${details.notes}` : null,
      "",
      "*Items*",
      ...lines,
      "",
      `*Total: ${formatPrice(cartTotal(cart))}*`,
      "",
      "Please confirm my order. Thank you!",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function toggleMenu() {
    const open = document.body.classList.toggle("nav-open");
    navToggle?.setAttribute("aria-expanded", String(open));
    navToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function closeMenu() {
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
  }

  function openSearch() {
    closeMenu();
    if (!searchOverlay) return;
    searchOverlay.hidden = false;
    searchOverlay.classList.add("is-visible");
    searchInput?.focus();
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("is-visible");
    searchOverlay.hidden = true;
    if (searchInput) searchInput.value = "";
  }

  function highlightProduct(id) {
    document.querySelectorAll(".product-card").forEach((card) => {
      card.classList.toggle("is-highlighted", id === "all" ? true : card.dataset.productId === id);
    });
    setTimeout(() => {
      document.querySelectorAll(".product-card.is-highlighted").forEach((card) => {
        card.classList.remove("is-highlighted");
      });
    }, 2200);
  }

  function scrollToShop(productId) {
    const shop = document.getElementById("shop");
    shop?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (productId) {
      setTimeout(() => highlightProduct(productId), 350);
    }
  }

  /* Events */
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      if (!card) return;
      const product = {
        id: card.dataset.productId,
        name: card.dataset.productName,
        price: Number(card.dataset.productPrice),
        image: card.dataset.productImage,
      };
      if (!product.id || !product.name || Number.isNaN(product.price)) return;
      addToCart(product);
      const label = btn.querySelector("span");
      const prev = label?.textContent || "Add to Cart";
      btn.classList.add("is-added");
      if (label) label.textContent = "Added ✓";
      setTimeout(() => {
        btn.classList.remove("is-added");
        if (label) label.textContent = prev;
      }, 1200);
    });
  });

  document.querySelectorAll("[data-shop-product]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToShop(link.dataset.shopProduct);
    });
  });

  openBtn?.addEventListener("click", openCart);
  closeBtn?.addEventListener("click", closeCart);
  overlay?.addEventListener("click", closeCart);
  clearBtn?.addEventListener("click", clearCart);
  checkoutBtn?.addEventListener("click", openCheckout);
  checkoutCloseBtn?.addEventListener("click", closeCheckout);
  checkoutOverlay?.addEventListener("click", closeCheckout);

  checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const cart = loadCart();
    if (!cart.length) {
      showToast("Your cart is empty");
      closeCheckout();
      return;
    }

    const details = {
      name: document.getElementById("checkoutName").value.trim(),
      phone: document.getElementById("checkoutPhone").value.trim(),
      address: document.getElementById("checkoutAddress").value.trim(),
      notes: document.getElementById("checkoutNotes").value.trim(),
    };

    if (!/^\d{10}$/.test(details.phone)) {
      showToast("Enter a valid 10-digit phone number");
      return;
    }

    const message = buildWhatsAppOrder(details);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
    saveCart([]);
    renderCart();
    closeCheckout();
    showToast("Order sent — confirm on WhatsApp");
    checkoutForm.reset();
  });

  itemsEl?.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const row = target.closest(".cart-item");
    if (!row) return;
    const id = row.dataset.id;
    const action = target.dataset.action;
    if (action === "inc") changeQty(id, 1);
    if (action === "dec") changeQty(id, -1);
    if (action === "remove") removeItem(id);
  });

  navToggle?.addEventListener("click", toggleMenu);

  navMenu?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
      navMenu.querySelectorAll(".nav-link").forEach((el) => el.classList.remove("active"));
      link.classList.add("active");
    });
  });

  searchBtn?.addEventListener("click", openSearch);
  searchCloseBtn?.addEventListener("click", closeSearch);
  searchOverlay?.addEventListener("click", (event) => {
    if (event.target === searchOverlay) closeSearch();
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = (searchInput?.value || "").trim().toLowerCase();
    closeSearch();
    if (!q) return;

    const product = [...document.querySelectorAll(".product-card")].find((card) => {
      const name = (card.dataset.productName || "").toLowerCase();
      const id = (card.dataset.productId || "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });

    if (product) {
      scrollToShop(product.dataset.productId);
      showToast(`Found: ${product.dataset.productName}`);
      return;
    }

    const category = [...document.querySelectorAll(".category-card")].find((card) =>
      (card.querySelector(".cat-title")?.textContent || "").toLowerCase().includes(q)
    );
    if (category) {
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
      category.classList.add("is-highlighted");
      setTimeout(() => category.classList.remove("is-highlighted"), 2200);
      showToast("Category found");
      return;
    }

    showToast("No matching product found");
  });

  prodPrev?.addEventListener("click", () => {
    productsGrid?.scrollBy({ left: -280, behavior: "smooth" });
  });
  prodNext?.addEventListener("click", () => {
    productsGrid?.scrollBy({ left: 280, behavior: "smooth" });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      closeCheckout();
      closeMenu();
      closeSearch();
    }
  });

  renderCart();

  const productQuery = new URLSearchParams(window.location.search).get("product");
  if (productQuery) {
    requestAnimationFrame(() => scrollToShop(productQuery));
  }
})();
