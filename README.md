# Falcon Shop

Proyecto de Programación 4: recreación de la interfaz de comercio electrónico del panel Falcon.

## Integrantes

- Integrante 1: HTML y estructura
- Integrante 2: CSS y Bootstrap
- Integrante 3: JavaScript

## Tecnologías

- HTML5
- CSS3 con metodología BEM
- Bootstrap 5

## Ramas de trabajo

- `main`: versión principal
- `feature/html`: estructura HTML
- `feature/estilos`: estilos y diseño responsive

## Demo

https://falcon-shop-p4.netlify.app

## Convenciones CSS (BEM)

- **Bloque:** componente independiente. Ejemplos: `topbar`, `sidebar`, `catalog`, `product-card`.
- **Elemento:** parte de un bloque, separada con `__`. Ejemplo: `product-card__price`.
- **Modificador:** variante o estado, separado con `--`. Ejemplos: `product-card--soldout`, `product-card__btn-fav--active`, `sidebar__link--active`.
- Las clases de Bootstrap se usan para estructura, grilla y utilidades. Las clases BEM se usan para los estilos propios en `css/styles.css`.