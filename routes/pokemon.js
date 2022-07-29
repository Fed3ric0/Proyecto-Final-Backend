const { verifyToken } = require("../middlewares/validate-jwt");

const express = require("express");
const router = express.Router();
const {
  getPokemon,
  getPokemonTypeByName,
  getPokemonDescriptionByName,
  getPokemonWeightByName,
  getPokemonStatsByName,
  agregarPokemon,
  deletePokemonByName,
  putPokemonById,
  getPokemonById,
} = require("../controllers/pokemon");

router.get("/pokemon", getPokemon);
router.get("/pokemon/:id", getPokemonById);
router.get("/pokemon/:nombre/tipo", getPokemonTypeByName);
router.get("/pokemon/:nombre/descripcion", getPokemonDescriptionByName);
router.get("/pokemon/:nombre/peso", getPokemonWeightByName);
router.get("/pokemon/:nombre/stats", getPokemonStatsByName);
router.post("/pokemon", verifyToken, agregarPokemon);
router.delete("/pokemon/:nombre", verifyToken, deletePokemonByName);
router.put("/pokemon/:id", verifyToken, putPokemonById);

module.exports = router;
