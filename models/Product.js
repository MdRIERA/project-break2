const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  Nombre: {
    type: String,
    required: true,
    trim: true
  },

  Descripcion: {
    type: String,
    required: true
  },

  Imagen: {
    type: String,
    required: true
  },
  ImagenId: {
    type: String,
    required: true
  },
  Categoria: {
    type: String,
    required: true,
    enum: ["Ropa", "Calzado", "Accesorios", "Deportiva", "Urbana"]
  },

  Talla: {
    type: String,
    required: true,
    enum: ["XS", "S", "M", "L", "XL", "XXL"]
  },

  Precio: {
    type: Number,
    required: true,
    min: 0
  }
});

module.exports = mongoose.model("Product", ProductSchema);
