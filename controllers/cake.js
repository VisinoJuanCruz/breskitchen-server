const { Cake } = require("../models/cake");

const getAll = async (req, res) => {
    try {
      const cakes = await Cake.find()
        .populate({
          path: 'ingredients.ingredient',
          select: 'name priceKg', // Incluye los campos 'name' y 'priceKg' del ingrediente
        })
        .sort({name:1})
        .exec();
  
      res.json(cakes); // Devuelve las tortas con información de ingredientes populada en formato JSON como respuesta
    } catch (error) {
      console.error('Error al obtener las tortas', error);
      res.status(500).json({ error: 'Error al obtener las tortas' });
    }
  }
const getAllOfer = async (req, res) => {
    try {
      const cakes = await Cake.find({ofer:'true'})
        .populate({
          path: 'ingredients.ingredient',
          select: 'name priceKg', // Incluye los campos 'name' y 'priceKg' del ingrediente
        })
        .sort({name:1})
        .exec();
  
      res.json(cakes); // Devuelve las tortas con información de ingredientes populada en formato JSON como respuesta
    } catch (error) {
      console.error('Error al obtener las tortas', error);
      res.status(500).json({ error: 'Error al obtener las tortas' });
    }
  }
const updateOne = async (req, res) => {
    const cakeId = req.params.id;
    const updatedCakeData = req.body; // Los nuevos datos de la receta
    console.log(updatedCakeData)
  
    try {
      const updatedCake = await Cake.findByIdAndUpdate(
        cakeId,
        updatedCakeData,
        { new: true } // Para obtener la versión actualizada de la receta
      );
  
      if (!updatedCake) {
        return res.status(404).json({ error: 'Receta no encontrada' });
      }
  
      res.json(updatedCake);
    } catch (error) {
      console.error('Error al actualizar la receta', error);
      res.status(500).json({ error: 'Error al actualizar la receta' });
    }
  }
const getOne = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Buscar la receta por ID en la base de datos
      const recipe = await Cake.findById(id)
        .populate({
          path: 'ingredients.ingredient',
          select: 'name priceKg', // Incluir los campos 'name' y 'priceKg' del ingrediente
        })
        .exec();
  
      if (!recipe) {
        return res.status(404).json({ error: 'Receta no encontrada' });
      }
  
      res.json(recipe); // Devolver los detalles de la receta en formato JSON
    } catch (error) {
      console.error('Error al obtener los detalles de la receta', error);
      res.status(500).json({ error: 'Error al obtener los detalles de la receta' });
    }
  }
const deleteOne = async (req, res) => {
    const cakeId = req.params.id;
  
    try {
      const deletedCake = await Cake.findByIdAndRemove(cakeId);
  
      if (!deletedCake) {
        return res.status(404).json({ error: 'Receta no encontrada' });
      }
  
      res.json({ message: 'Receta eliminada con éxito' });
    } catch (error) {
      console.error('Error al eliminar la receta', error);
      res.status(500).json({ error: 'Error al eliminar la receta' });
    }
  }
const createOne = async (req, res) => {
    const cake = req.body;
    console.log(cake);
    
    const ingredientsIds = cake.ingredients.map((ingredient) => {
      if (/^[0-9a-fA-F]{24}$/.test(ingredient.ingredientId)) {
        return new mongoose.Types.ObjectId(ingredient.ingredientId);
      } else {
        // Manejar el caso en el que ingredientId no sea válido (por ejemplo, mostrar un error).
        return null; // O cualquier otra acción adecuada en tu aplicación
      }
    });
    
    // Filtra los elementos nulos en caso de que algunos ingredientId no sean válidos
    const validIngredientsIds = ingredientsIds.filter((id) => id !== null);
    
    Cake.create({
      name: cake.name,
      description: cake.description,
      price: cake.price,
      ofer: cake.ofer,
      image: cake.image,
      category: cake.category ,
      ingredients: cake.ingredients.map((ingredientData) => ({
        ingredient: ingredientData.ingredient,
        quantity: ingredientData.quantity
      })),
    }).then((createdCake) => {
      console.log("Cargando:", cake);
      console.log("Objeto Cake creado:", createdCake); // Agrega esta línea para verificar el objeto Cake creado
      res.status(201).json(createdCake);
    }).catch((error) => {
      console.error("Error al crear el pastel:", error);
      res.status(500).json({ error: "Error al crear el pastel" });
    });
  }
const updateOnePrice = async (req, res) => {
    const cakeId = req.params.id;
    const newPrice = req.body.price; // Nuevo precio por kilo enviado en el cuerpo de la solicitud
  
    try {
      const updatedCake = await Cake.findByIdAndUpdate(
        cakeId,
        { price: newPrice },
        { new: true } // Para obtener la versión actualizada de la receta
      );
  
      if (!updatedCake) {
        return res.status(404).json({ error: 'Receta no encontrada' });
      }
  
      res.json(updatedCake);
    } catch (error) {
      console.error('Error al actualizar el precio de la receta', error);
      res.status(500).json({ error: 'Error al actualizar el precio de la receta' });
    }
  }


module.exports = { getAll, getAllOfer, updateOne, updateOnePrice, getOne, deleteOne, createOne };