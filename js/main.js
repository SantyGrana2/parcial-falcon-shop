"use strict";

const sidebar = document.getElementById("sidebar");
const submenus = sidebar.querySelectorAll(".sidebar__submenu");
const sidebarLinks = sidebar.querySelectorAll("a.sidebar__link");

submenus.forEach((submenu) => {
  submenu.addEventListener("show.bs.collapse", () => {
    submenus.forEach((other) => {
      if (other !== submenu && other.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(other, { toggle: false }).hide();
      }
    });
  });
});

sidebarLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    sidebarLinks.forEach((other) => {
      other.classList.remove("sidebar__link--active");
      other.removeAttribute("aria-current");
    });

    link.classList.add("sidebar__link--active");
    link.setAttribute("aria-current", "page");

    const offcanvas = bootstrap.Offcanvas.getInstance(sidebar);
    if (offcanvas) {
      offcanvas.hide();
    }
  });
});

const searchForm = document.querySelector(".topbar__search");
const searchInput = document.getElementById("search-input");
const productList = document.getElementById("product-list");
const resultsCount = document.getElementById("results-count");
const noResults = document.getElementById("no-results");
const products = Array.from(productList.querySelectorAll(".product-card"));

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function updateResultsCount(visibleCount) {
  if (visibleCount === 0) {
    resultsCount.textContent = `Showing 0 of ${products.length} Products`;
  } else {
    resultsCount.textContent = `Showing 1-${visibleCount} of ${products.length} Products`;
  }

  noResults.classList.toggle("d-none", visibleCount > 0);
  productList.classList.toggle("d-none", visibleCount === 0);
}

function filterProducts() {
  const query = normalizeText(searchInput.value);
  let visibleCount = 0;

  products.forEach((product) => {
    const searchableText = normalizeText(`${product.dataset.name} ${product.dataset.category}`);
    const matches = searchableText.includes(query);

    product.classList.toggle("d-none", !matches);

    if (matches) {
      visibleCount++;
    }
  });

  updateResultsCount(visibleCount);
}

searchInput.addEventListener("input", filterProducts);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  filterProducts();
});

const favoriteButtons = productList.querySelectorAll(".product-card__btn-fav");
const favorites = new Set();

function setFavoriteState(button, isFavorite) {
  const icon = button.querySelector(".bi");

  button.classList.toggle("product-card__btn-fav--active", isFavorite);
  button.setAttribute("aria-pressed", String(isFavorite));
  icon.classList.toggle("bi-heart", !isFavorite);
  icon.classList.toggle("bi-heart-fill", isFavorite);
}

favoriteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.closest(".product-card").dataset.name;
    const isFavorite = !favorites.has(productName);

    if (isFavorite) {
      favorites.add(productName);
    } else {
      favorites.delete(productName);
    }

    setFavoriteState(button, isFavorite);
  });
});

const cartCount = document.getElementById("cart-count");
const cartButtons = productList.querySelectorAll(".product-card__btn-cart");
const cart = new Map();

function getCartTotal() {
  let total = 0;

  cart.forEach((quantity) => {
    total += quantity;
  });

  return total;
}

function updateCartCount() {
  cartCount.textContent = getCartTotal();
  cartCount.classList.add("topbar__badge--bump");
}

cartCount.addEventListener("animationend", () => {
  cartCount.classList.remove("topbar__badge--bump");
});

cartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.closest(".product-card");

    if (product.dataset.stock !== "true") {
      return;
    }

    const productName = product.dataset.name;
    const currentQuantity = cart.get(productName) ?? 0;

    cart.set(productName, currentQuantity + 1);
    updateCartCount();
  });
});