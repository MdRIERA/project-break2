// controllers/autcontroller.js
require("dotenv").config();

const { baseHtml } = require("../helpers/baseHtml");
const { getNavBar } = require("../helpers/navBar");

const renderLogin = (req, { errorMsg = "" } = {}) => {
  const errorHtml = errorMsg
    ? `<p class="danger" style="padding:10px;border-radius:10px;border:1px solid #ffb3b3;">${errorMsg}</p>`
    : "";

  const body = `
    ${getNavBar(req, { isDashboard: false })}

    <div class="login-wrap">
      <h2>Login Admin</h2>
      ${errorHtml}

      <form method="POST" action="/login" class="login-form">
        <label>Usuario</label>
        <input name="user" placeholder="Usuario" required />

        <label>Password</label>
        <input type="password" name="password" placeholder="Password" required />

        <button type="submit">Entrar</button>
      </form>
    </div>
  `;

  return baseHtml("Login Admin", body);
};

const showLogin = (req, res) => {
  res.send(renderLogin(req));
};

const login = (req, res) => {
  const { user, password } = req.body;

  if (user === process.env.USER && password === process.env.PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/dashboard");
  }

  return res.status(401).send(renderLogin(req, { errorMsg: "Credenciales incorrectas" }));
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/products");
  });
};

module.exports = { showLogin, login, logout };