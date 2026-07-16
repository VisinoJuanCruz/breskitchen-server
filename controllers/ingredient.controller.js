const { Ingredient } = require("../models/ingredient");
const { IngredientPriceHistory } = require("../models/ingredientPriceHistory");
const recipeImpactService = require("../services/recipeImpact.service");


const getAll = async (req, res) => {
    Ingredient.find().sort({name:1}).then((ingredients)=>{
        res.status(200).json(ingredients)
    })
  }
const createOne = async (req, res) => {

    const ingredient = req.body;

    try {

        const createdIngredient = await Ingredient.create({

            name: ingredient.name,

            unit: ingredient.unit ?? "kg",

            quantity: ingredient.quantity ?? 0,

            minStock: ingredient.minStock ?? 0,

            priceKg: ingredient.priceKg ?? 0,

            defaultBrand: ingredient.defaultBrand ?? "",

            defaultSupplier: ingredient.defaultSupplier ?? "",

            note: ingredient.note ?? ""

        });

        console.log("Cargando:", ingredient);

        res.status(201).json(createdIngredient);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error al crear ingrediente"

        });

    }

};

const updateOne = async (req, res) => {

    const ingredientId = req.params.id;

    try {

        const updatedIngredient =
            await Ingredient.findByIdAndUpdate(

                ingredientId,

                {

                    name: req.body.name,

                    unit: req.body.unit,

                    quantity: req.body.quantity,

                    minStock: req.body.minStock,

                    defaultBrand: req.body.defaultBrand,

                    defaultSupplier: req.body.defaultSupplier,

                    note: req.body.note

                },

                {

                    new: true,
                    runValidators: true

                }

            );

        if (!updatedIngredient) {

            return res.status(404).json({

                error: "Ingrediente no encontrado"

            });

        }

        res.json(updatedIngredient);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error actualizando ingrediente"

        });

    }

}

const updateOnePrice = async (req, res) => {
    const ingredientId = req.params.id;
    const { priceKg, brand = "", supplier = "", note = "" } = req.body;

    try {

        const ingredient = await Ingredient.findById(ingredientId);

        if (!ingredient) {
            return res.status(404).json({
                error: "Ingrediente no encontrado"
            });
        }

        const previousPrice = ingredient.priceKg;

        // Actualizar precio
        ingredient.priceKg = priceKg;

        await ingredient.save();

        // Guardar historial
        await IngredientPriceHistory.create({

            ingredient: ingredient._id,

            previousPrice,

            newPrice: priceKg,

            brand,

            supplier,

            note

        });

        // Calcular impacto en recetas
        const affectedRecipes =
            await recipeImpactService.calculateImpact(
                ingredient._id,
                previousPrice,
                priceKg
            );

        res.json({

            ingredient,

            affectedRecipes

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error al actualizar el precio del ingrediente"

        });

    }

};
const updateOneName = async (req, res) => {
    const ingredientId = req.params.id;
    const newName = req.body.name; // Nuevo nombre enviado en el cuerpo de la solicitud
  
    try {
      const updatedIngredient = await Ingredient.findByIdAndUpdate(
        ingredientId,
        { name: newName },
        { new: true } // Para obtener la versión actualizada del ingrediente
      );
  
      if (!updatedIngredient) {
        return res.status(404).json({ error: 'Ingrediente no encontrado' });
      }
  
      res.json(updatedIngredient);
    } catch (error) {
      console.error('Error al actualizar el nombre del ingrediente', error);
      res.status(500).json({ error: 'Error al actualizar el nombre del ingrediente' });
    }
  }
const deleteOne = async (req, res) => {
    const ingredientId = req.params.id;
  
    try {
      const deletedIngredient = await Ingredient.findByIdAndRemove(ingredientId);
  
      if (!deletedIngredient) {
        return res.status(404).json({ error: 'Ingrediente no encontrado' });
      }
  
      res.json({ message: 'Ingrediente eliminado con éxito' });
    } catch (error) {
      console.error('Error al eliminar el ingrediente', error);
      res.status(500).json({ error: 'Error al eliminar el ingrediente' });
    }
  }

module.exports = {getAll,createOne, updateOne, updateOnePrice,updateOneName, deleteOne}