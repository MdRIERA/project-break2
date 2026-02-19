// routes/productRoutes.js
const express = require("express");
const upload = require("../middlewares/uploadCloudinaryMiddleware");
const productController = require("../controllers/productContoller");
const { isAdmin } = require("../middlewares/authMiddleware");

const routes = express.Router();

// Público
routes.get("/products", productController.showProducts);
routes.get("/products/:productId", productController.showProductById);

// Dashboard protegido
routes.get("/dashboard", isAdmin, productController.showDashboard);
routes.get("/dashboard/new", isAdmin, productController.showNewProduct);
routes.get("/dashboard/:productId", isAdmin, productController.showDashboardProductById);

// Crear (POST)
routes.post("/dashboard", isAdmin, upload.single("image"), productController.createProduct);

// Edit
routes.get("/dashboard/:productId/edit", isAdmin, productController.showEditProduct);

// Update (PUT)
routes.put("/dashboard/:productId", isAdmin, upload.single("image"), productController.updateProduct);

// Delete (DELETE)
routes.delete("/dashboard/:productId/delete", isAdmin, productController.deleteProduct);


module.exports = routes;
