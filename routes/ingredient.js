const express = require('express');
const {getAll, createOne ,updateOne, updateOnePrice,updateOneName, deleteOne} = require('../controllers/ingredient');
const router = express.Router();


router.get("/", getAll)

router.post("/", createOne)

// Ruta para actualizar un ingrediente por su ID
router.put('/:id', updateOne);

// Ruta para actualizar el precio de un ingrediente por su ID
router.put('/updatePrice/:id', updateOnePrice);

// Ruta para actualizar el nombre de un ingrediente por su ID
router.put('/updateName/:id',updateOneName );

// Ruta para eliminar un ingrediente por su ID
router.delete('/:id', deleteOne);

module.exports = router