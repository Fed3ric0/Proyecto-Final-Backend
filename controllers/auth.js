const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TOKEN_SECRET } = require("../middlewares/validate-jwt");

const { validationResult } = require("express-validator");

const pool = new Pool({
  user: "postgres",
  database: "Pokedex DataBase",
  password: "fede",
});

const usuarios = [
  {
    name: "Ramiro",
    mail: "ramiro@hotmail.com",
    password: "$2b$10$0wyZA3wQWkypYNuIaYc.YeUgqvamJmoxzdsBXZjiDqLIi2ki18YeC",
  },
];

exports.postUsuario = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  const passwordConfirmation = await bcrypt.hash(
    req.body.passwordConfirmation,
    salt
  );

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // if (password !== passwordConfirmation) {
  //   res.sendStatus(400);
  // }

  await pool.query(
    "INSERT INTO usuarios(nombre, email, password)VALUES($1, $2, $3)",
    [req.body.nombre, req.body.email, password]
  );
  res.json({ success: true });
};

exports.postLogin = async (req, res) => {
  const { rows } = await pool.query("SELECT * from usuarios WHERE email = $1", [
    req.body.mail,
  ]);
  const user = rows[0];

  if (!user) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: "Contraseña no valida" });
  }

  const token = jwt.sign(
    {
      name: user.name,
      id: user.id,
    },
    TOKEN_SECRET
  );

  res.json({ error: null, data: "Login exitoso", token });
};
