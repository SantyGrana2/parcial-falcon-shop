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
    saveFavorites();
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

    if (currentQuantity >= MAX_QUANTITY_PER_PRODUCT) {
      return;
    }

    cart.set(productName, currentQuantity + 1);
    updateCartCount();
    saveCart();
  });
});

const sortSelect = document.getElementById("sort-by");
const sortOrderButton = document.getElementById("sort-order");

function sortProducts() {
  const sortKey = sortSelect.value;
  const direction = sortOrderButton.dataset.order === "asc" ? 1 : -1;

  products.sort((productA, productB) => {
    const valueA = Number(productA.dataset[sortKey]);
    const valueB = Number(productB.dataset[sortKey]);

    return (valueA - valueB) * direction;
  });

  productList.append(...products);
}

sortSelect.addEventListener("change", sortProducts);

sortOrderButton.addEventListener("click", () => {
  const newOrder = sortOrderButton.dataset.order === "asc" ? "desc" : "asc";
  const icon = sortOrderButton.querySelector(".bi");

  sortOrderButton.dataset.order = newOrder;
  icon.classList.toggle("bi-sort-up", newOrder === "asc");
  icon.classList.toggle("bi-sort-down", newOrder === "desc");

  if (newOrder === "asc") {
    sortOrderButton.setAttribute("aria-label", "Sort order: ascending");
  } else {
    sortOrderButton.setAttribute("aria-label", "Sort order: descending");
  }

  sortProducts();
});

const STORAGE_KEYS = {
  favorites: "falconShop.favorites",
  cart: "falconShop.cart",
};
const MAX_QUANTITY_PER_PRODUCT = 99;
const MAX_SEARCH_LENGTH = 50;

const productNames = new Set(products.map((product) => product.dataset.name));
const availableProductNames = new Set(
  products
    .filter((product) => product.dataset.stock === "true")
    .map((product) => product.dataset.name)
);

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("No se pudo guardar en localStorage:", error);
  }
}

function readFromStorage(key) {
  try {
    const rawValue = localStorage.getItem(key);

    if (rawValue === null) {
      return null;
    }

    return JSON.parse(rawValue);
  } catch (error) {
    console.warn("Datos guardados inválidos, se ignoran:", error);
    return null;
  }
}

function saveFavorites() {
  saveToStorage(STORAGE_KEYS.favorites, Array.from(favorites));
}

function saveCart() {
  saveToStorage(STORAGE_KEYS.cart, Array.from(cart.entries()));
}

function loadFavorites() {
  const savedFavorites = readFromStorage(STORAGE_KEYS.favorites);

  if (!Array.isArray(savedFavorites)) {
    return;
  }

  savedFavorites.forEach((name) => {
    if (productNames.has(name)) {
      favorites.add(name);
    }
  });

  favoriteButtons.forEach((button) => {
    const productName = button.closest(".product-card").dataset.name;
    setFavoriteState(button, favorites.has(productName));
  });
}

function loadCart() {
  const savedCart = readFromStorage(STORAGE_KEYS.cart);

  if (!Array.isArray(savedCart)) {
    return;
  }

  savedCart.forEach((entry) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      return;
    }

    const [name, quantity] = entry;
    const isValidQuantity = Number.isInteger(quantity) && quantity > 0 && quantity <= MAX_QUANTITY_PER_PRODUCT;

    if (availableProductNames.has(name) && isValidQuantity) {
      cart.set(name, quantity);
    }
  });

  cartCount.textContent = getCartTotal();
}

searchInput.maxLength = MAX_SEARCH_LENGTH;
loadFavorites();
loadCart();