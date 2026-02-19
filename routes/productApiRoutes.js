const express = require("express");
const upload = require("../middlewares/uploadCloudinaryMiddleware");
const productController = require("../controllers/productContoller");

const api = express.Router();

// JSON público
api.get("/products", productController.getProductsJson);
api.get("/products/:productId", productController.getProductByIdJson);
api.post("/products", upload.single("image"), productController.createProductJson);
api.put("/products/:productId", upload.single("image"), productController.updateProductJson);
api.delete("/products/:productId", productController.deleteProductJson);


module.exports = api;
