# ProjectBreak2 🛍️ (Tienda + Dashboard Admin + API)

Aplicación web con **Node.js + Express + MongoDB** que incluye:

- ✅ **Tienda SSR** (listado y detalle de productos)
- ✅ **Dashboard Admin** (CRUD de productos protegido)
- ✅ **API REST** para productos (rutas bajo `/api`)
- ✅ **Swagger UI** para documentación (`/api-docs`)
- ✅ **Subida de imágenes** (middleware Cloudinary)
- ✅ **Tests con Jest + Supertest**

---

## 🚀 Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- SSR con HTML (render manual desde controller/helpers)
- express-session
- method-override (para PUT/DELETE desde formularios)
- Cloudinary (subida de imágenes)
- Swagger UI (OpenAPI)
- Jest + Supertest (tests)

---

## 📌 Requisitos

- Node.js (v18+ recomendado)
- MongoDB (Atlas o local)
- Cuenta de Cloudinary (solo si vas a usar subida real de imágenes)

---

## ⚙️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/MdRIERA/project-break2.git
```
cd project-break2
Instala dependencias:

npm install
🔐 Variables de entorno (.env)
Este proyecto usa variables de entorno. En el repositorio tienes un archivo .envexample  con las variables necesarias.

Crea tu .env a partir del ejemplo:

Mac / Linux

cp .envexample .env
Windows (PowerShell)

Copy-Item .envexample .env
Rellena los valores en .env (MongoDB, credenciales admin y Cloudinary).

⚠️ Importante: no subas tu .env real al repositorio (contiene secretos).

▶️ Ejecutar el proyecto
npm start
La app arranca en:

Login admin: http://localhost:3000/login

Tienda: http://localhost:3000/products

Swagger UI: http://localhost:3000/api-docs

👤 Autor

Martín Riera Bernardo

GitHub: https://github.com/MdRIERA

Render:https://project-break2.onrender.com
