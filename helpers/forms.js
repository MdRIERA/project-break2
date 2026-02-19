// helpers/forms.js
const CATEGORIAS = ["Ropa", "Calzado", "Accesorios", "Deportiva", "Urbana"];
const TALLAS = ["XS", "S", "M", "L", "XL", "XXL"];

function optionsHtml(options, selectedValue = "") {
  return options
    .map((opt) => {
      const selected = opt === selectedValue ? "selected" : "";
      return `<option value="${opt}" ${selected}>${opt}</option>`;
    })
    .join("");
}

function getProductForm({ product = null, action, isEdit = false } = {}) {
  const methodOverride = isEdit
    ? `<input type="hidden" name="_method" value="PUT" />`
    : "";

  const nombre = product?.Nombre ?? "";
  const descripcion = product?.Descripcion ?? "";
  const categoria = product?.Categoria ?? "";
  const talla = product?.Talla ?? "";
  const precio = product?.Precio ?? "";

  return `
    <form action="${action}" method="POST" enctype="multipart/form-data">
      ${methodOverride}

      <label>Nombre</label>
      <input name="Nombre" value="${nombre}" required />

      <label>Descripción</label>
      <textarea name="Descripcion" required>${descripcion}</textarea>

      <label>Categoría</label>
      <select name="Categoria" required>
        <option value="" disabled ${categoria ? "" : "selected"}>Elige una categoría</option>
        ${optionsHtml(CATEGORIAS, categoria)}
      </select>

      <label>Talla</label>
      <select name="Talla" required>
        <option value="" disabled ${talla ? "" : "selected"}>Elige una talla</option>
        ${optionsHtml(TALLAS, talla)}
      </select>

      <label>Precio</label>
      <input name="Precio" type="number" step="0.01" min="0" value="${precio}" required />

      <label>Imagen</label>
      <input name="image" type="file" accept="image/*" ${isEdit ? "" : "required"} />

      <button type="submit">${isEdit ? "Guardar cambios" : "Crear producto"}</button>
    </form>
  `;
}

module.exports = { getProductForm, CATEGORIAS, TALLAS };
