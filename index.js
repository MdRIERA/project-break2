require("dotenv").config();
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./openapi.yaml");


const ssrRoutes = require("./routes/productRoutes");    
const apiRoutes = require("./routes/productApiRoutes");   
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI;

// 1) Parsers primero
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ ANTES
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
// 2) method override después del body parser
app.use(methodOverride("_method")); // ✅ DESPUÉS

// 3) session
app.use(
  session({
    secret: "supersecret123",
    resave: false,
    saveUninitialized: false,
  })
);

// 4) routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
  res.redirect("/login"); // o "/products"
});
app.use(authRoutes);
app.use('/api',apiRoutes);
app.use(ssrRoutes);

if (require.main === module) {
  connectDB(mongo_uri);
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}/login`);
  });
}

module.exports = app;
