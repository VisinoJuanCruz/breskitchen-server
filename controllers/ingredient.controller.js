
const mongoose = require("mongoose");
const VALID_UNITS = ["kg", "g", "l", "ml", "unidad"];

const { Ingredient } = require("../models/ingredient");
const { IngredientPriceHistory } = require("../models/ingredientPriceHistory");
const { Cake } = require("../models/cake");
const recipeImpactService = require("../services/recipeImpact.service");

const getAll = async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.status(200).json(ingredients);
  } catch (error) {
    console.error("Error al obtener ingredientes:", error);
    res.status(500).json({ error: "Error al obtener ingredientes" });
  }
};

const createOne = async (req, res) => {
  try {
    const ingredient = req.body;

    const createdIngredient = await Ingredient.create({
      name: ingredient.name,
      unit: ingredient.unit ?? "kg",
      stock: ingredient.stock ?? 0,
      minStock: ingredient.minStock ?? 0,
      unitPrice: ingredient.unitPrice ?? 0,
      defaultBrand: ingredient.defaultBrand ?? "",
      defaultSupplier: ingredient.defaultSupplier ?? "",
      note: ingredient.note ?? "",
    });

    console.log("Ingrediente creado:", createdIngredient);
    res.status(201).json(createdIngredient);
  } catch (error) {
    console.error("Error al crear ingrediente:", error);
    res.status(500).json({ error: "Error al crear ingrediente" });
  }
};

const updateOne = async (req, res) => {
  const ingredientId = req.params.id;
  const session = await mongoose.startSession();

  try {
    let updatedIngredient;

    await session.withTransaction(async () => {
      const ingredient = await Ingredient.findById(ingredientId).session(session);

      if (!ingredient) {
        const error = new Error("Ingrediente no encontrado");
        error.statusCode = 404;
        throw error;
      }

      const newUnit = req.body.unit ?? ingredient.unit;
      const previousUnit = ingredient.unit;

      if (!VALID_UNITS.includes(newUnit)) {
        const error = new Error("Unidad de medida inválida");
        error.statusCode = 400;
        throw error;
      }

      // Si cambia la unidad, actualizar todas sus apariciones en recetas.
      // Se conserva exactamente el valor de quantity.
      if (newUnit !== previousUnit) {
        await Cake.updateMany(
          { "ingredients.ingredient": ingredient._id },
          {
            $set: {
              "ingredients.$[item].quantityUnit": newUnit,
            },
          },
          {
            arrayFilters: [{ "item.ingredient": ingredient._id }],
            session,
          },
        );
      }

      // Actualizar los datos del ingrediente.
      if (req.body.name !== undefined) ingredient.name = req.body.name;
      if (req.body.unit !== undefined) ingredient.unit = newUnit;
      if (req.body.stock !== undefined) ingredient.stock = Number(req.body.stock);
      if (req.body.minStock !== undefined) ingredient.minStock = Number(req.body.minStock);
      if (req.body.unitPrice !== undefined) ingredient.unitPrice = Number(req.body.unitPrice);
      if (req.body.defaultBrand !== undefined) ingredient.defaultBrand = req.body.defaultBrand;
      if (req.body.defaultSupplier !== undefined) ingredient.defaultSupplier = req.body.defaultSupplier;
      if (req.body.note !== undefined) ingredient.note = req.body.note;

      await ingredient.save({ session });
      updatedIngredient = ingredient;
    });

    res.status(200).json(updatedIngredient);
  } catch (error) {
    console.error("Error actualizando ingrediente:", error);

    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Error actualizando ingrediente",
    });
  } finally {
    await session.endSession();
  }
};

const updateOnePrice = async (req, res) => {
  const ingredientId = req.params.id;
  const { unitPrice, brand = "", supplier = "", note = "" } = req.body;

  try {
    const ingredient = await Ingredient.findById(ingredientId);

    if (!ingredient) {
      return res.status(404).json({ error: "Ingrediente no encontrado" });
    }

    const previousPrice = ingredient.unitPrice;

    ingredient.unitPrice = unitPrice;
    await ingredient.save();

    await IngredientPriceHistory.create({
      ingredient: ingredient._id,
      previousPrice,
      newPrice: unitPrice,
      brand,
      supplier,
      note,
    });

    const affectedRecipes = await recipeImpactService.calculateImpact(
      ingredient._id,
      previousPrice,
      unitPrice,
    );

    console.log("ENTRÉ A updateOnePrice");
    console.log({ ingredient, affectedRecipes });

    res.json({ ingredient, affectedRecipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al actualizar el precio del ingrediente",
    });
  }
};

const updateOneName = async (req, res) => {
  const ingredientId = req.params.id;
  const newName = req.body.name;

  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      ingredientId,
      { name: newName },
      { new: true },
    );

    if (!updatedIngredient) {
      return res.status(404).json({ error: "Ingrediente no encontrado" });
    }

    res.json(updatedIngredient);
  } catch (error) {
    console.error("Error al actualizar el nombre del ingrediente", error);
    res.status(500).json({
      error: "Error al actualizar el nombre del ingrediente",
    });
  }
};

const deleteOne = async (req, res) => {
  const ingredientId = req.params.id;

  try {
    const deletedIngredient = await Ingredient.findByIdAndRemove(ingredientId);

    if (!deletedIngredient) {
      return res.status(404).json({ error: "Ingrediente no encontrado" });
    }

    res.json({ message: "Ingrediente eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el ingrediente", error);
    res.status(500).json({ error: "Error al eliminar el ingrediente" });
  }
};

module.exports = {
  getAll,
  createOne,
  updateOne,
  updateOnePrice,
  updateOneName,
  deleteOne,
};