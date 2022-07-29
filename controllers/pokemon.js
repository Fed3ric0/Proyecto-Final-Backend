const pokemon = require("../models/pokemones");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  database: "Pokedex DataBase",
  password: "fede",
});

exports.getPokemon = async (req, res) => {
  const { rows } = await pool.query(
    "SELECT pokemon.id, pokemon.nombre, pokemon.imagen, array_agg(distinct tipo.nombre) as tipo from pokemon INNER JOIN tipo ON pokemon.id = tipo.id_pokemon WHERE pokemon.eliminado=false group by pokemon.id"
  );
  res.send(rows);
};

exports.getPokemonById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT pokemon.*, array_agg(distinct tipo.nombre) as tipo, array_agg(distinct habilidades.nombre) as habilidades, json_agg(stats.*) as base from pokemon INNER JOIN tipo ON pokemon.id = tipo.id_pokemon INNER JOIN habilidades ON pokemon.id = habilidades.id_pokemon INNER JOIN stats ON pokemon.id = stats.id_pokemon WHERE pokemon.id = $1 group by pokemon.id ",
      [id]
    );
    console.log(rows);
    const { hp, atk, def, satk, sdef, spd } = rows[0].base[0];
    const pokemon = { ...rows[0], base: { hp, atk, def, satk, sdef, spd } };
    res.send(pokemon);
  } catch (error) {
    res.sendStatus(404);
  }
};

exports.getPokemonTypeByName = (req, res) => {
  const { nombre } = req.params;
  const tipoPokemon = pokemon.find(
    (e) => e.name.english.toLowerCase() === nombre.toLowerCase()
  );
  res.send(tipoPokemon.type);
};

exports.getPokemonDescriptionByName = (req, res) => {
  const { nombre } = req.params;
  const tipoPokemon = pokemon.find(
    (e) => e.name.english.toLowerCase() === nombre.toLowerCase()
  );
  res.send(tipoPokemon.description);
};

exports.getPokemonWeightByName = (req, res) => {
  const { nombre } = req.params;
  const tipoPokemon = pokemon.find(
    (e) => e.name.english.toLowerCase() === nombre.toLowerCase()
  );
  res.send(tipoPokemon.profile.weight);
};

exports.getPokemonStatsByName = (req, res) => {
  const { nombre } = req.params;
  const unPokemon = pokemon.find(
    (e) => e.name.english.toLowerCase() === nombre.toLowerCase()
  );
  res.send({ nombre: unPokemon.name.english, stats: unPokemon.base });
};

exports.agregarPokemon = async (req, res) => {
  //   const listaPokemon = pokemon;
  const {
    nombre,
    id,
    tipo1,
    tipo2,
    HP,
    ATK,
    DEF,
    SATK,
    SDEF,
    SPD,
    descripcion,
    peso,
    altura,
    movimiento1,
    movimiento2,
    imagen,
  } = req.body;

  await pool.query(
    "INSERT INTO pokemon(id, nombre, descripcion, altura, peso, imagen)VALUES($1, $2, $3, $4, $5, $6)",
    [id, nombre, descripcion, altura, peso, imagen]
  );

  await pool.query("INSERT INTO tipo(id_pokemon, nombre)VALUES($1, $2)", [
    id,
    tipo1,
  ]);

  if (tipo2) {
    await pool.query("INSERT INTO tipo(id_pokemon, nombre)VALUES($1, $2)", [
      id,
      tipo2,
    ]);
  }

  await pool.query(
    "INSERT INTO habilidades(id_pokemon, nombre)VALUES($1, $2)",
    [id, movimiento1]
  );

  if (movimiento2) {
    await pool.query(
      "INSERT INTO habilidades(id_pokemon, nombre)VALUES($1, $2)",
      [id, movimiento2]
    );
  }

  await pool.query(
    "INSERT INTO stats(id_pokemon, hp, atk, def, satk, sdef, spd)VALUES($1, $2, $3, $4, $5, $6, $7)",
    [id, HP, ATK, DEF, SATK, SDEF, SPD]
  );

  res.json({ success: true });
};

exports.deletePokemonByName = async (req, res) => {
  const { nombre } = req.params;

  await pool.query(
    "UPDATE pokemon SET eliminado = true WHERE pokemon.nombre = $1",
    [nombre]
  );
  res.send("El pokemon se ha eliminado");
};

exports.putPokemonById = (req, res) => {
  const { id } = req.params;
  const { name, type, height, weight } = req.query;
  const pokemonIndice = pokemon.findIndex((e) => e.id == id);

  if (name) {
    pokemon[pokemonIndice].name.english = name;
  }
  if (type) {
    pokemon[pokemonIndice].type = type;
  }
  if (height) {
    pokemon[pokemonIndice].profile.height = height;
  }
  if (weight) {
    pokemon[pokemonIndice].profile.weight = weight;
  }

  // {Object.key (pokemon.stats).map(
  //     ([nombreDeLaProp, valorDeLaProp]) => (
  //       <p style={{ color: pokemon.color }}>{nombreDeLaProp}</p>
  //     )
  //   )}

  res.send(pokemon[pokemonIndice]);
};
