const { Cake } = require("../models/cake");
const mongoose = require("mongoose");
const cakeRepository = require("../repositories/cake.repository");
const costService = require("../services/cost.service");
const cloudinaryService = require("../services/cloudinary.service");

const parseIngredients = (ingredients) => {
  if (typeof ingredients === "string") {
    return JSON.parse(ingredients);
  }

  if (Array.isArray(ingredients)) {
    return ingredients;
  }

  throw new Error("Formato de ingredientes inválido");
};

const getAll = async (req, res) => {
  try {
    const recipes = await cakeRepository.findAll();

    const recipesWithCosts = recipes.map((recipe) =>
      costService.calculateRecipeCost(recipe),
    );

    res.json(recipesWithCosts);
  } catch (error) {
    console.error("Error al obtener las recetas", error);

    res.status(500).json({
      error: "Error al obtener las recetas",
    });
  }
};
const getAllOfer = async (req, res) => {
  try {
    const cakes = await Cake.find({ ofer: "true" })
      .populate({
        path: "ingredients.ingredient",
        select: "name unitPrice", // Incluye los campos 'name' y 'unitPrice' del ingrediente
      })
      .sort({ name: 1 })
      .exec();

    res.json(cakes); // Devuelve las tortas con información de ingredientes populada en formato JSON como respuesta
  } catch (error) {
    console.error("Error al obtener las tortas", error);
    res.status(500).json({ error: "Error al obtener las tortas" });
  }
};

const updateOne = async (req, res) => {
  const cakeId = req.params.id;
  let uploadedPublicId = null;

  try {
    const existingCake = await Cake.findById(cakeId);

    if (!existingCake) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    const updateData = { ...req.body };

    if (updateData.ingredients) {
      updateData.ingredients = parseIngredients(updateData.ingredients);
    }

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.discountRate !== undefined) {
      updateData.discountRate =
        updateData.discountRate === "" ||
        updateData.discountRate === "undefined"
          ? 0
          : Number(updateData.discountRate);
    }

    // Subir una nueva imagen solamente si se recibió un archivo.
    if (req.file) {
      const uploadResult = await cloudinaryService.uploadImage(
        req.file.buffer,
        "breskitchen/cakes",
      );

      uploadedPublicId = uploadResult.public_id;

      updateData.image = uploadResult.secure_url;
      updateData.imagePublicId = uploadResult.public_id;
    }

    const updatedCake = await Cake.findByIdAndUpdate(cakeId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCake) {
      // La receta pudo desaparecer antes de completar la actualización.
      if (uploadedPublicId) {
        await cloudinaryService.deleteImage(uploadedPublicId);
      }

      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    // Eliminar la imagen anterior solo después de guardar la nueva URL.
    if (req.file && existingCake.imagePublicId) {
      try {
        await cloudinaryService.deleteImage(existingCake.imagePublicId);
      } catch (deleteError) {
        console.error(
          "La receta se actualizó, pero no se pudo eliminar la imagen anterior:",
          deleteError,
        );
      }
    }

    return res.json(updatedCake);
  } catch (error) {
    console.error("Error al actualizar la receta:", error);

    // Si falló la actualización, limpiar la imagen nueva que quedó sin usar.
    if (uploadedPublicId) {
      try {
        await cloudinaryService.deleteImage(uploadedPublicId);
      } catch (cleanupError) {
        console.error(
          "No se pudo limpiar la nueva imagen de Cloudinary:",
          cleanupError,
        );
      }
    }

    return res.status(500).json({
      error: "Error al actualizar la receta",
    });
  }
};

const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la receta por ID en la base de datos
    const recipe = await Cake.findById(id)
      .populate({
        path: "ingredients.ingredient",
        select: "name unitPrice", // Incluir los campos 'name' y 'unitPrice' del ingrediente
      })
      .exec();

    if (!recipe) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    res.json(recipe); // Devolver los detalles de la receta en formato JSON
  } catch (error) {
    console.error("Error al obtener los detalles de la receta", error);
    res
      .status(500)
      .json({ error: "Error al obtener los detalles de la receta" });
  }
};
const deleteOne = async (req, res) => {
  const cakeId = req.params.id;

  try {
    const deletedCake = await Cake.findByIdAndDelete(cakeId);

    if (!deletedCake) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    res.json({ message: "Receta eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la receta", error);
    res.status(500).json({ error: "Error al eliminar la receta" });
  }
};
const createOne = async (req, res) => {
  try {
    const cake = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: "La imagen es obligatoria",
      });
    }

    const uploadResult = await cloudinaryService.uploadImage(
      req.file.buffer,
      "breskitchen/cakes",
    );

    const createdCake = await Cake.create({
      name: cake.name,
      description: cake.description,
      price: cake.price,
      discountRate:
        cake.discountRate === undefined ||
        cake.discountRate === null ||
        cake.discountRate === "" ||
        cake.discountRate === "undefined"
          ? 0
          : Number(cake.discountRate),
      ofer: cake.ofer ?? false,

      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,

      category: cake.category,
      carousel: cake.carousel ?? false,
      outstanding: cake.outstanding ?? false,

      ingredients: parseIngredients(cake.ingredients).map((ingredient) => ({
        ingredient: ingredient.ingredient,
        quantity: Number(ingredient.quantity),
        stage: ingredient.stage ?? "default",
      })),

      yieldQuantity: cake.yieldQuantity ?? 1,
      yieldUnit: cake.yieldUnit ?? "unidad",
      yieldName: cake.yieldName ?? "",
    });

    console.log("Receta creada:", createdCake);

    res.status(201).json(createdCake);
  } catch (error) {
    console.error("Error al crear la receta:", error);

    res.status(500).json({
      error: "Error al crear la receta",
    });
  }
};
const updateOnePrice = async (req, res) => {
  const cakeId = req.params.id;
  const newPrice = req.body.price;

  try {
    const updatedCake = await Cake.findByIdAndUpdate(
      cakeId,
      {
        price: newPrice,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCake) {
      return res.status(404).json({
        error: "Receta no encontrada",
      });
    }

    res.json(updatedCake);
  } catch (error) {
    console.error("Error al actualizar el precio de la receta:", error);

    res.status(500).json({
      error: "Error al actualizar el precio de la receta",
    });
  }
};

module.exports = {
  getAll,
  getAllOfer,
  updateOne,
  updateOnePrice,
  getOne,
  deleteOne,
  createOne,
};
