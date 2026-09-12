const express = require("express");
const {
  getAll,
  getAllOfer,
  updateOne,
  updateOnePrice,
  getOne,
  deleteOne,
  createOne,
} = require("../controllers/cake.controller");
const authMiddleware = require("../middleware/auth");
const {
  createCakeValidators,
  updateCakeValidators,
  updateCakePriceValidators,
  getCakeByIdValidators,
  deleteCakeValidators,
  handleValidationErrors,
} = require("../middleware/validators");
const router = express.Router();

// Define una ruta para obtener todas las tortas con información de ingredientes populada
router.get("/", getAll);

router.get("/ofer", getAllOfer);

router.post("/", authMiddleware, createCakeValidators, handleValidationErrors, createOne);

// Ruta para actualizar una receta por su ID
router.put("/:id", authMiddleware, updateCakeValidators, handleValidationErrors, updateOne);

router.put("/updatePrice/:id", authMiddleware, updateCakePriceValidators, handleValidationErrors, updateOnePrice);

// En tu archivo de rutas en el backend (puede variar según tu estructura de archivos)
router.get("/:id", getCakeByIdValidators, handleValidationErrors, getOne);

// Ruta para eliminar una receta por su ID
router.delete("/:id", authMiddleware, deleteCakeValidators, handleValidationErrors, deleteOne);

module.exports = router;
