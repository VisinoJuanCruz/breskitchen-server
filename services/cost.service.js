const VALID_UNITS = ["kg", "g", "l", "ml", "unidad"];

/**
 * Convierte una cantidad desde la unidad de receta
 * hacia la unidad de compra del ingrediente.
 */
function convertToBaseUnit(quantity, recipeUnit, ingredientUnit) {
  if (!VALID_UNITS.includes(recipeUnit)) {
    throw new Error(`Unidad de receta inválida: ${recipeUnit}`);
  }

  if (!VALID_UNITS.includes(ingredientUnit)) {
    throw new Error(`Unidad de compra inválida: ${ingredientUnit}`);
  }

  if (recipeUnit === ingredientUnit) {
    return quantity;
  }

  const conversions = {
    g: { kg: 0.001 },
    kg: { g: 1000 },
    ml: { l: 0.001 },
    l: { ml: 1000 },
  };

  const factor = conversions[recipeUnit]?.[ingredientUnit];

  if (factor === undefined) {
    throw new Error(
      `No se puede convertir de ${recipeUnit} a ${ingredientUnit}`,
    );
  }

  return quantity * factor;
}

/**
 * Calcula el costo de un ingrediente.
 */
function calculateIngredientCost(
  unitPrice,
  quantity,
  quantityUnit,
  ingredientUnit,
) {
  const price = Number(unitPrice);
  const amount = Number(quantity);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio del ingrediente no es válido");
  }

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("La cantidad del ingrediente no es válida");
  }

  if (!quantityUnit || !ingredientUnit) {
    throw new Error("Faltan las unidades del ingrediente");
  }

  if (price === 0 || amount === 0) {
    return 0;
  }

  const convertedQuantity = convertToBaseUnit(
    amount,
    quantityUnit,
    ingredientUnit,
  );

  return Number((price * convertedQuantity).toFixed(2));
}

/**
 * Compatibilidad con recetas antiguas:
 * - Si no tienen quantityUnit y se compra por kg,
 *   asumimos que la cantidad histórica está expresada en gramos.
 * - Para otras unidades, usamos la unidad de compra.
 */
function getRecipeIngredientUnit(item, ingredient) {
  if (item.quantityUnit) {
    return item.quantityUnit;
  }

  if (ingredient.unit === "kg") {
    return "g";
  }

  return ingredient.unit;
}

/**
 * Calcula una línea individual sin interrumpir el resto de la receta.
 */
function calculateIngredientLine(item) {
  const ingredient = item.ingredient;

  if (!ingredient || typeof ingredient !== "object") {
    return {
      ...item,
      cost: null,
      costError: "No se pudo obtener el ingrediente asociado a la receta",
    };
  }

  try {
    const quantityUnit = getRecipeIngredientUnit(item, ingredient);

    const cost = calculateIngredientCost(
      ingredient.unitPrice,
      item.quantity,
      quantityUnit,
      ingredient.unit,
    );

    return {
      ...item,
      quantityUnit,
      cost,
      costError: null,
    };
  } catch (error) {
    return {
      ...item,
      quantityUnit: item.quantityUnit || null,
      cost: null,
      costError: error.message,
    };
  }
}

/**
 * Calcula el costo total de una receta.
 */
function calculateRecipeCost(recipe) {
  const recipeData =
    typeof recipe.toObject === "function" ? recipe.toObject() : { ...recipe };

  const ingredients = (recipeData.ingredients || []).map(
    calculateIngredientLine,
  );

  const hasErrors = ingredients.some((item) => item.costError);

  const totalCost = hasErrors
    ? null
    : Number(
        ingredients.reduce((total, item) => total + item.cost, 0).toFixed(2),
      );

  return {
    ...recipeData,
    ingredients,
    totalCost,
    costCalculationValid: !hasErrors,
  };
}

/**
 * Calcula el costo de una receta desagregado por etapa.
 */
function calculateRecipeCostByStage(recipe) {
  const recipeData =
    typeof recipe.toObject === "function" ? recipe.toObject() : { ...recipe };

  const stages = [
    "masa",
    "bizcochuelo",
    "relleno",
    "salsa",
    "cobertura",
    "decoracion",
    "terminacion",
    "otro",
    "default",
  ];

  const costByStage = {};
  const stageHasErrors = {};

  stages.forEach((stage) => {
    costByStage[stage] = 0;
    stageHasErrors[stage] = false;
  });

  const ingredients = (recipeData.ingredients || []).map((item) => {
    const calculatedItem = calculateIngredientLine(item);
    const stage = item.stage || "default";

    if (costByStage[stage] === undefined) {
      costByStage[stage] = 0;
      stageHasErrors[stage] = false;
    }

    if (calculatedItem.costError) {
      stageHasErrors[stage] = true;
    } else {
      costByStage[stage] += calculatedItem.cost;
    }

    return calculatedItem;
  });

  Object.keys(costByStage).forEach((stage) => {
    costByStage[stage] = stageHasErrors[stage]
      ? null
      : Number(costByStage[stage].toFixed(2));
  });

  const hasErrors = ingredients.some((item) => item.costError);

  const totalCost = hasErrors
    ? null
    : Number(
        ingredients.reduce((total, item) => total + item.cost, 0).toFixed(2),
      );

  return {
    ...recipeData,
    ingredients,
    costByStage: {
      ...costByStage,
      total: totalCost,
    },
    totalCost,
    costCalculationValid: !hasErrors,
  };
}

/**
 * Retorna un resumen simplificado del costo por etapa.
 */
function getCostSummaryByStage(recipe) {
  const costData = calculateRecipeCostByStage(recipe);
  return costData.costByStage;
}

module.exports = {
  convertToBaseUnit,
  calculateIngredientCost,
  calculateRecipeCost,
  calculateRecipeCostByStage,
  getCostSummaryByStage,
};