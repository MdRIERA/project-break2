const ProductModel = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const { baseHtml } = require("../helpers/baseHtml");
const { getNavBar } = require("../helpers/navBar");
const { getProductCards } = require("../helpers/productCards");
const { getProductForm } = require("../helpers/forms");
const { CATEGORIAS, TALLAS } = require("../helpers/forms");
const productController = {
  // GET /products
showProducts: async (req, res) => {
  try {
    const { cat, talla, q, min, max } = req.query;

    const filter = {};

    // Categoría
    if (cat && CATEGORIAS.includes(cat)) {
      filter.Categoria = cat;
    }

    // Talla
    if (talla && TALLAS.includes(talla)) {
      filter.Talla = talla;
    }

    // Búsqueda por nombre (opcional)
    if (q && q.trim()) {
      filter.Nombre = { $regex: q.trim(), $options: "i" };
    }

    // Precio min/max (opcional)
    if (min || max) {
      filter.Precio = {};
      if (min) filter.Precio.$gte = Number(min);
      if (max) filter.Precio.$lte = Number(max);
    }

    const products = await ProductModel.find(filter).lean();

    const body =
      getNavBar(req, { isDashboard: false, currentCat: cat || "" }) +
      getProductCards(products, { isDashboard: false });

    res.send(baseHtml("Productos", body));
  } catch (error) {
    console.error(error);
    res.status(500).send(baseHtml("Error", "Error en el servidor"));
  }
},

  // GET /products/:productId
  showProductById: async (req, res) => {
    const id = req.params.productId;
    const product = await ProductModel.findById(id).lean();

    if (!product) {
      return res
        .status(404)
        .send(baseHtml("No encontrado", "Producto no encontrado"));
    }

    const body =
      getNavBar(req, { isDashboard: false }) +
      `
      <div class="card">
        <img src="${product.Imagen}" alt="${product.Nombre}" />
        <h2>${product.Nombre}</h2>
        <p>${product.Descripcion}</p>
        <p><strong>${product.Precio}€</strong></p>
        <p>Categoría: ${product.Categoria} | Talla: ${product.Talla}</p>
      </div>
    `;

    res.send(baseHtml("Detalle del producto", body));
  },

  // GET /dashboard
  showDashboard: async (req, res) => {
    const products = await ProductModel.find().lean();

    const body =
      getNavBar(req, { isDashboard: true }) +
      getProductCards(products, { isDashboard: true });

    res.send(baseHtml("Dashboard", body));
  },

  // GET /dashboard/new
  showNewProduct: async (req, res) => {
    const body =
      getNavBar(req, { isDashboard: true }) +
      getProductForm({ action: "/dashboard", isEdit: false });

    res.send(baseHtml("Nuevo producto", body));
  },

  // POST /dashboard
  createProduct: async (req, res) => {
    try {
      if (!req.file) {
        const body =
          getNavBar(req, { isDashboard: true }) +
          `<p class="danger">La imagen es obligatoria</p>` +
          getProductForm({ action: "/dashboard", isEdit: false });

        return res.status(400).send(baseHtml("Nuevo producto", body));
      }

      const product = await ProductModel.create({
        ...req.body,
        Imagen: req.file.path,
        ImagenId: req.file.filename,
      });

      return res.redirect(`/dashboard/${product._id}`);
    } catch (error) {
      console.error(error);
      return res.status(500).send(baseHtml("Error", "Error en el servidor"));
    }
  },

  // GET /dashboard/:productId
  showDashboardProductById: async (req, res) => {
    const id = req.params.productId;
    const product = await ProductModel.findById(id).lean();

    if (!product) {
      return res
        .status(404)
        .send(baseHtml("No encontrado", "Producto no encontrado"));
    }

    const body =
      getNavBar(req, { isDashboard: true }) +
      `
      <div class="card">
        <img src="${product.Imagen}" alt="${product.Nombre}" />
        <h2>${product.Nombre}</h2>
        <p>${product.Descripcion}</p>
        <p><strong>${product.Precio}€</strong></p>
        <p>Categoría: ${product.Categoria} | Talla: ${product.Talla}</p>

        <div class="actions">
          <a class="pill" href="/dashboard/${product._id}/edit">Editar</a>

          <form action="/dashboard/${product._id}/delete?_method=DELETE" method="POST" style="display:inline">
            <button class="danger" type="submit">Eliminar</button>
          </form>

        </div>
      </div>
    `;

    res.send(baseHtml("Detalle (Dashboard)", body));
  },

  // GET /dashboard/:productId/edit
  showEditProduct: async (req, res) => {
    const id = req.params.productId;
    const product = await ProductModel.findById(id).lean();

    if (!product) {
      return res
        .status(404)
        .send(baseHtml("No encontrado", "Producto no encontrado"));
    }

    const body =
      getNavBar(req, { isDashboard: true }) +
      getProductForm({
        product,
        action: `/dashboard/${product._id}`,
        isEdit: true,
      });

    res.send(baseHtml("Editar producto", body));
  },

  // PUT /dashboard/:productId
  updateProduct: async (req, res) => {
    try {
      const id = req.params.productId;
      const product = await ProductModel.findById(id);

      if (!product) {
        return res
          .status(404)
          .send(baseHtml("No encontrado", "Producto no encontrado"));
      }

      const updates = {};
      if (req.body.Nombre !== undefined) updates.Nombre = req.body.Nombre;
      if (req.body.Descripcion !== undefined)
        updates.Descripcion = req.body.Descripcion;
      if (req.body.Categoria !== undefined)
        updates.Categoria = req.body.Categoria;
      if (req.body.Talla !== undefined) updates.Talla = req.body.Talla;
      if (req.body.Precio !== undefined)
        updates.Precio = Number(req.body.Precio);

      if (req.file) {
        if (product.ImagenId)
          await cloudinary.uploader.destroy(product.ImagenId);
        updates.Imagen = req.file.path;
        updates.ImagenId = req.file.filename;
      }

      await ProductModel.findByIdAndUpdate(id, updates, {
        runValidators: true,
      });

      return res.redirect(`/dashboard/${id}`);
    } catch (error) {
      console.error(error);
      return res.status(500).send(baseHtml("Error", "Error en el servidor"));
    }
  },

  // DELETE /dashboard/:productId/delete
  deleteProduct: async (req, res) => {
    try {
      const id = req.params.productId;
      const product = await ProductModel.findById(id);

      if (!product) {
        return res
          .status(404)
          .send(baseHtml("No encontrado", "Producto no encontrado"));
      }

      if (product.ImagenId) await cloudinary.uploader.destroy(product.ImagenId);
      await ProductModel.findByIdAndDelete(id);

      return res.redirect("/dashboard");
    } catch (error) {
      console.error(error);
      return res.status(500).send(baseHtml("Error", "Error en el servidor"));
    }
  },
  // GET /api/products
  getProductsJson: async (req, res) => {
    try {
      const products = await ProductModel.find().lean();
      return res.json({ data: products });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  },

  // GET /api/products/:productId
  getProductByIdJson: async (req, res) => {
    try {
      const id = req.params.productId;
      const product = await ProductModel.findById(id).lean();
      if (!product)
        return res.status(404).json({ error: "Producto no encontrado" });
      return res.json({ data: product });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  },
  // POST /api/products
  createProductJson: async (req, res) => {
    try {
      // Si usas upload.single("image") en la ruta:
      // req.file.path => URL Cloudinary
      // req.file.filename => public_id Cloudinary (en multer-storage-cloudinary)
      const payload = {
        ...req.body,
      };

      if (req.file) {
        payload.Imagen = req.file.path;
        payload.ImagenId = req.file.filename;
      }

      // Si tu schema exige imagen y no llega
      if (!payload.Imagen) {
        return res.status(400).json({ error: "La imagen es obligatoria" });
      }
      if (!payload.ImagenId) {
        return res.status(400).json({ error: "ImagenId es obligatoria" });
      }

      const product = await ProductModel.create(payload);
      return res
        .status(201)
        .json({ data: product, message: "Producto creado" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  },
  // PUT /api/products/:productId
  updateProductJson: async (req, res) => {
    try {
      const id = req.params.productId;

      // Construimos updates solo con lo que venga
      const updates = {};
      if (req.body.Nombre !== undefined) updates.Nombre = req.body.Nombre;
      if (req.body.Descripcion !== undefined)
        updates.Descripcion = req.body.Descripcion;
      if (req.body.Categoria !== undefined)
        updates.Categoria = req.body.Categoria;
      if (req.body.Talla !== undefined) updates.Talla = req.body.Talla;
      if (req.body.Precio !== undefined)
        updates.Precio = Number(req.body.Precio);

      // Si suben nueva imagen
      if (req.file) {
        // Borrar imagen anterior si existía
        const current = await ProductModel.findById(id);
        if (!current) {
          return res.status(404).json({ error: "Producto no encontrado" });
        }

        if (current.ImagenId) {
          await cloudinary.uploader.destroy(current.ImagenId);
        }

        updates.Imagen = req.file.path;
        updates.ImagenId = req.file.filename;
      }

      // Si no viene nada
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No hay campos para actualizar" });
      }

      const product = await ProductModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).lean();

      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      return res.json({ data: product, message: "Producto actualizado" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  },
  // DELETE /api/products/:productId
  deleteProductJson: async (req, res) => {
    try {
      const id = req.params.productId;

      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Borra imagen en Cloudinary si hay public_id
      if (product.ImagenId) {
        await cloudinary.uploader.destroy(product.ImagenId);
      }

      await ProductModel.findByIdAndDelete(id);
      return res.json({ message: "Producto borrado" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  },
};

module.exports = productController;
