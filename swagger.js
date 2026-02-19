const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tienda API",
      version: "1.0.0",
      description: "Documentación de la API de productos",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Aquí leerá comentarios JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
