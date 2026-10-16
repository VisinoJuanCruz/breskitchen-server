const express = require("express");
const upload = require("../middleware/upload");

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
const requireImage = require("../middleware/requireImage");
const parseRecipeData = require("../middleware/parseRecipeData");

// Define una ruta para obtener todas las tortas con información de ingredientes populada
router.get("/", getAll);

router.get("/ofer", getAllOfer);

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  parseRecipeData,
  requireImage,
  createCakeValidators,
  handleValidationErrors,
  createOne,
);
// Ruta para actualizar una receta por su ID
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  parseRecipeData,
  updateCakeValidators,
  handleValidationErrors,
  updateOne,
);
router.put(
  "/updatePrice/:id",
  authMiddleware,
  updateCakePriceValidators,
  handleValidationErrors,
  updateOnePrice,
);

// En tu archivo de rutas en el backend (puede variar según tu estructura de archivos)
router.get("/:id", getCakeByIdValidators, handleValidationErrors, getOne);

// Ruta para eliminar una receta por su ID
router.delete(
  "/:id",
  authMiddleware,
  deleteCakeValidators,
  handleValidationErrors,
  deleteOne,
);

module.exports = router;
