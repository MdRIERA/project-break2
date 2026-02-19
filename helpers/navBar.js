// helpers/navBar.js
const { CATEGORIAS } = require("./forms");

function getNavBar(req, { isDashboard = false, currentCat = "" } = {}) {
  let html = `<nav>`;

  // Tienda (sin filtro)
  const shopActive = !currentCat && !isDashboard ? "active" : "";
  html += `<a class="${shopActive}" href="/products">Tienda</a>`;

  // Categorías SOLO en tienda
  if (!isDashboard) {
    for (const cat of CATEGORIAS) {
      const active = cat === currentCat ? "active" : "";
      html += `<a class="${active}" href="/products?cat=${encodeURIComponent(cat)}">${cat}</a>`;
    }
  }

  // Admin
  if (req.session?.isAdmin) {
    html += `<a href="/dashboard">Dashboard</a>`;
    html += `<a href="/dashboard/new">Nuevo</a>`;
    html += `<a href="/logout">Salir</a>`;
  } else {
    html += `<a href="/login">Admin</a>`;
  }

  html += `</nav>`;
  return html;
}

module.exports = { getNavBar };