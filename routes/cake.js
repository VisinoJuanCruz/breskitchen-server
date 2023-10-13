const express = require('express');
const { getAll, getAllOfer, updateOne, updateOnePrice, getOne, deleteOne, createOne } = require('../controllers/cake');
const router = express.Router();


// Define una ruta para obtener todas las tortas con información de ingredientes populada
router.get('/', getAll);
  
  router.get('/ofer', getAllOfer);
  

  router.post("/", createOne)
  
// Ruta para actualizar una receta por su ID
router.put('/:id', updateOne);
  
  router.put('/updatePrice/:id', updateOnePrice );
  
// En tu archivo de rutas en el backend (puede variar según tu estructura de archivos)
router.get('/:id', getOne);
  
// Ruta para eliminar una receta por su ID
router.delete('/:id', deleteOne );
  
module.exports = router
  