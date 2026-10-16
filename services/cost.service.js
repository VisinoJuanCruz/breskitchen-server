function calculateIngredientCost(unitPrice, grams) {

    if (!unitPrice || !grams) {
        return 0;
    }

    // Asumir unitPrice es siempre por kg (después será más flexible)
    return Number(((unitPrice / 1000) * grams).toFixed(2));

}

function calculateRecipeCost(recipe) {

    // Si viene un documento de Mongoose lo convertimos.
    // Si ya es un objeto plano lo usamos directamente.
    const recipeData =
        typeof recipe.toObject === "function"
            ? recipe.toObject()
            : { ...recipe };

    let totalCost = 0;

    const ingredients = recipeData.ingredients.map(item => {

        const ingredientCost = calculateIngredientCost(
            item.ingredient.unitPrice,
            item.quantity
        );

        totalCost += ingredientCost;

        return {

            ...item,

            cost: ingredientCost

        };

    });

    return {

        ...recipeData,

        ingredients,

        totalCost: Number(totalCost.toFixed(2))

    };

}

/**
 * Calcula el costo de una receta desagregado por stage
 * Retorna un objeto con costos por cada stage y el total
 * 
 * @param {Object} recipe - Documento de receta con ingredientes que incluyen stage
 * @returns {Object} { bizcochuelo: X, relleno: Y, cobertura: Z, decoracion: A, otro: B, default: C, total: T }
 */
function calculateRecipeCostByStage(recipe) {

    const recipeData =
        typeof recipe.toObject === "function"
            ? recipe.toObject()
            : { ...recipe };

    const stages = ["bizcochuelo", "relleno", "cobertura", "decoracion", "otro", "default"];
    const costByStage = {};
    let totalCost = 0;

    // Inicializar contadores para cada stage
    stages.forEach(stage => {
        costByStage[stage] = 0;
    });

    // Calcular costo por ingredient y acumular por stage
    const ingredients = recipeData.ingredients.map(item => {

        const ingredientCost = calculateIngredientCost(
            item.ingredient.unitPrice,
            item.quantity
        );

        const stage = item.stage || "default";
        costByStage[stage] = Number((costByStage[stage] + ingredientCost).toFixed(2));
        totalCost += ingredientCost;

        return {
            ...item,
            cost: ingredientCost
        };

    });

    return {
        ...recipeData,
        ingredients,
        costByStage: {
            ...costByStage,
            total: Number(totalCost.toFixed(2))
        },
        totalCost: Number(totalCost.toFixed(2))
    };

}

/**
 * Retorna un resumen simplificado del costo por stage
 * Útil para dashboards o reportes
 * 
 * @param {Object} recipe - Documento de receta
 * @returns {Object} { bizcochuelo: X, relleno: Y, ... total: T }
 */
function getCostSummaryByStage(recipe) {
    const costData = calculateRecipeCostByStage(recipe);
    return costData.costByStage;
}

module.exports = {

    calculateIngredientCost,

    calculateRecipeCost,

    calculateRecipeCostByStage,

    getCostSummaryByStage

};