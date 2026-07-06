function calculateIngredientCost(priceKg, grams) {

    if (!priceKg || !grams) {
        return 0;
    }

    return Number(((priceKg / 1000) * grams).toFixed(2));

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
            item.ingredient.priceKg,
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

module.exports = {

    calculateIngredientCost,

    calculateRecipeCost

};