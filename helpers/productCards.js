function getProductCards(products, { isDashboard = false } = {}) {
  let html = `<div class="grid">`;

  for (const p of products) {
    const detailUrl = isDashboard ? `/dashboard/${p._id}` : `/products/${p._id}`;

    html += `
      <div class="card">
        <img src="${p.Imagen}" alt="${p.Nombre}" />
        <h2>${p.Nombre}</h2>
        <p>${p.Descripcion}</p>
        <p><strong>${p.Precio}€</strong></p>
        <a href="${detailUrl}">Ver detalle</a>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

module.exports = { getProductCards };
