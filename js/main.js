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