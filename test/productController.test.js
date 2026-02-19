/**
 * test/productController.test.js
 *
 * Qué estoy testeando aquí:
 * - Mis rutas reales SSR: /products y /dashboard
 * - El CRUD (crear, leer, actualizar, borrar)
 *
 * Problemas típicos que evito:
 * - Las rutas del dashboard llevan isAdmin (si no, me bloquearía)
 * - Crear/editar usa upload.single("image") (sin esto, mi controller puede fallar)
 * - Mis controladores pueden devolver JSON o hacer redirect (302), así que lo contempllo
 *
 * Nota:
 * - Uso Mongo real (MONGO_URI del .env) para comprobar que se creó/actualizó/borró.
 */

process.env.NODE_ENV = "test";

/* =========================
   1) Mocks de middlewares
   =========================
   Mockeo isAdmin para que en tests siempre deje pasar.
   Mockeo uploadCloudinaryMiddleware para simular una imagen subida (req.file).
*/

jest.mock("../middlewares/authMiddleware", () => ({
  isAdmin: (req, res, next) => next(),
}));

jest.mock("../middlewares/uploadCloudinaryMiddleware", () => ({
  single: () => (req, res, next) => {
    // Simulo que multer/cloudinary me ha generado un archivo subido
    req.file = {
      path: "https://test.com/img.jpg",
      filename: "test.jpg",
      originalname: "test.jpg",
    };
    next();
  },
}));

/* =========================
   2) Imports necesarios
   ========================= */

const request = require("supertest");
const mongoose = require("mongoose");

// Importo mi app (IMPORTANTE: debe exportar app en index.js)
let app;

// Importo mi modelo real para comprobar datos directamente en BD
const ProductModel = require("../models/Product");

/* =========================
   3) Helpers para parsing HTML
   =========================
   Como mis rutas SSR devuelven HTML, si necesito sacar datos del form,
   parseo el HTML para obtener valores válidos de <select>.
*/

function getSelectOptionsFromHtml(html, selectName) {
  const selectRegex = new RegExp(
    `<select[^>]*name=["']${selectName}["'][^>]*>([\\s\\S]*?)<\\/select>`,
    "i"
  );

  const selectMatch = html.match(selectRegex);
  if (!selectMatch) return [];

  const inside = selectMatch[1];

  const optionRegex = /<option[^>]*value=["']([^"']*)["'][^>]*>/gi;
  const values = [];
  let m;

  while ((m = optionRegex.exec(inside)) !== null) {
    const v = (m[1] || "").trim();
    if (!v) continue;
    // filtro placeholders típicos tipo "Selecciona..."
    if (/selecciona|elige|choose/i.test(v)) continue;
    values.push(v);
  }

  return values;
}

/* =========================
   4) Suite de tests
   ========================= */

describe("Productos (rutas reales /products y /dashboard)", () => {
  // Guardo aquí el id del producto creado para reutilizarlo en los demás tests
  let productId;

  // Estas variables las saco del formulario /dashboard/new para asegurar que
  // uso categorías y tallas válidas (si mi backend valida contra listas)
  let categoriaValida;
  let tallaValida;

  /* =========================
     beforeAll: preparo entorno
     =========================
     - Importo la app después de mocks
     - Conecto a Mongo con MONGO_URI
     - Pido /dashboard/new y saco Categoria/Talla válidas del HTML
  */
  beforeAll(async () => {
    app = require("../index");

    if (!process.env.MONGO_URI) {
      throw new Error("Falta MONGO_URI en .env para ejecutar los tests");
    }

    await mongoose.connect(process.env.MONGO_URI);

    // Pido el formulario real para sacar opciones válidas
    const formRes = await request(app).get("/dashboard/new");
    expect([200, 304]).toContain(formRes.statusCode);

    const html = formRes.text || "";

    const categorias = getSelectOptionsFromHtml(html, "Categoria");
    const tallas = getSelectOptionsFromHtml(html, "Talla");

    // Me quedo con la primera opción válida, y si no hay, uso fallback
    categoriaValida = categorias[0] || "Ropa";
    tallaValida = tallas[0] || "M";
  });

  /* =========================
     afterAll: limpio entorno
     =========================
     - Si quedó un producto creado, lo borro de BD
     - Cierro conexión Mongo
  */
  afterAll(async () => {
    try {
      if (productId) {
        await ProductModel.deleteOne({ _id: productId });
      }
    } catch (_) {}

    await mongoose.connection.close();
  });

  /* =========================
     TEST 1: Crear producto
     =========================
     - Hago POST /dashboard con datos válidos
     - Acepto 200/201/302 porque puede devolver JSON o redirigir
     - Para no depender del HTML/redirect, busco el producto en BD y saco el _id
  */
  test("Crear producto (POST /dashboard)", async () => {
    const payload = {
      Nombre: "Test Camiseta",
      Descripcion: "Producto test",
      Imagen: "https://test.com/img.jpg",
      Categoria: categoriaValida,
      Talla: tallaValida,
      Precio: 19.99,
    };

    const res = await request(app).post("/dashboard").send(payload);

    // Puede ser JSON o redirect
    expect([200, 201, 302]).toContain(res.statusCode);

    // Confirmo en BD que se creó realmente (esto es lo más fiable)
    const created = await ProductModel.findOne({ Nombre: "Test Camiseta" }).lean();
    expect(created).toBeTruthy();

    productId = String(created._id);
    expect(productId).toBeDefined();
  });

  /* =========================
     TEST 2: Obtener por ID
     =========================
     - Primero compruebo en BD que ese id existe
     - Luego hago GET /products/:id
     - Si devuelve HTML, valido que es la página de detalle y que contiene datos del producto
  */
  test("Obtener producto por ID (GET /products/:productId)", async () => {
    expect(productId).toBeDefined();

    const dbProduct = await ProductModel.findById(productId).lean();
    expect(dbProduct).toBeTruthy();

    const res = await request(app).get(`/products/${productId}`);
    expect([200, 304]).toContain(res.statusCode);

    const ct = res.headers["content-type"] || "";

    if (ct.includes("application/json")) {
      const product = res.body.data ?? res.body;
      expect(String(product._id)).toBe(String(productId));
    } else {
      // Como es SSR, compruebo que es la página de detalle y que aparece info del producto
      expect(res.text).toContain("Detalle del producto");

      // Si la plantilla imprime "Categoría: X | Talla: Y", lo verifico con los datos reales
      if (dbProduct.Categoria) expect(res.text).toContain(`Categoría: ${dbProduct.Categoria}`);
      if (dbProduct.Talla) expect(res.text).toContain(`Talla: ${dbProduct.Talla}`);

      // Y la descripción si se renderiza
      if (dbProduct.Descripcion) expect(res.text).toContain(dbProduct.Descripcion);
    }
  });

  /* =========================
     TEST 3: Actualizar producto
     =========================
     - Hago PUT /dashboard/:id cambiando precio y talla
     - Acepto 200/302 (JSON o redirect)
     - Verifico el cambio consultando directamente en BD
  */
  test("Actualizar producto (PUT /dashboard/:productId)", async () => {
    expect(productId).toBeDefined();

    const res = await request(app)
      .put(`/dashboard/${productId}`)
      .send({
        Precio: 25.99,
        Talla: tallaValida,
      });

    expect([200, 302]).toContain(res.statusCode);

    const updated = await ProductModel.findById(productId).lean();
    expect(updated).toBeTruthy();
    expect(Number(updated.Precio)).toBeCloseTo(25.99, 2);
  });

  /* =========================
     TEST 4: Borrar producto
     =========================
     - Hago DELETE /dashboard/:id/delete
     - Acepto 200/204/302
     - Confirmo que ya no existe en BD
  */
  test("Borrar producto (DELETE /dashboard/:productId/delete)", async () => {
    expect(productId).toBeDefined();

    const res = await request(app).delete(`/dashboard/${productId}/delete`);
    expect([200, 204, 302]).toContain(res.statusCode);

    const deleted = await ProductModel.findById(productId).lean();
    expect(deleted).toBeFalsy();
  });
});
