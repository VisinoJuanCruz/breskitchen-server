const express = require('express');
const {getAll, createOne ,updateOne, updateOnePrice,updateOneName, deleteOne} = require('../controllers/ingredient.controller');
const authMiddleware = require('../middleware/auth');
const {
  createIngredientValidators,
  updateIngredientPriceValidators,
  updateIngredientNameValidators,
  deleteIngredientValidators,
  handleValidationErrors,
} = require('../middleware/validators');
const router = express.Router();


router.get("/", getAll)

router.post("/", authMiddleware, createIngredientValidators, handleValidationErrors, createOne)

// Ruta para actualizar un ingrediente por su ID
router.put('/:id', authMiddleware, handleValidationErrors, updateOne);

// Ruta para actualizar el precio de un ingrediente por su ID
router.put('/updatePrice/:id', authMiddleware, updateIngredientPriceValidators, handleValidationErrors, updateOnePrice);

// Ruta para actualizar el nombre de un ingrediente por su ID
router.put('/updateName/:id', authMiddleware, updateIngredientNameValidators, handleValidationErrors, updateOneName);

// Ruta para eliminar un ingrediente por su ID
router.delete('/:id', authMiddleware, deleteIngredientValidators, handleValidationErrors, deleteOne);

module.exports = router