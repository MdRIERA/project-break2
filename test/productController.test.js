const request = require("supertest");
const app = require("../index"); // o donde exportes app
const mongoose = require("mongoose");

describe("Productos API", () => {
  let productId;

  beforeAll(async () => {
    // Asegúrate de tener MONGO_URI en .env (o usa .env.test)
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("Crear producto", async () => {
    const res = await request(app)
      .post("/api/create")
      .send({
        Nombre: "Test Camiseta",
        Descripcion: "Producto test",
        Imagen: "https://test.com/img.jpg",
        Categoria: "Test",
        Talla: "M",
        Precio: 19.99,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.Nombre).toBe("Test Camiseta");

    productId = res.body.data._id;
    expect(productId).toBeDefined();
  });

  test("Obtener producto por ID", async () => {
    const res = await request(app).get(`/api/product/${productId}`);

    expect(res.statusCode).toBe(200);
    // según tu controller, puede que lo devuelvas en res.body.data
    // ajusta una de estas dos según tu respuesta real:
   expect(res.body.data._id).toBe(productId);

  });

  test("Actualizar producto", async () => {
    const res = await request(app)
      .put(`/api/updateProduct/${productId}`)
      .send({
        precio: 25.99,
        talla: "L",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.Precio).toBe(25.99);
    expect(res.body.data.Talla).toBe("L");
  });

  test("Borrar producto", async () => {
    const res = await request(app).delete(`/api/product/${productId}`);

    expect(res.statusCode).toBe(200);
  });
});
