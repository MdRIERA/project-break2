//autentificador
function isAdmin(req, res, next) {
  // Si está logueado como admin
  if (req.session && req.session.isAdmin) {
    return next();
  }

  // Si no, redirige al login
  return res.redirect("/login");
}

module.exports = { isAdmin };
