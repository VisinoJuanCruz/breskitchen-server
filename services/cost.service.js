function calculateIngredientCost(priceKg, grams) {

    if (!priceKg || !grams) return 0;

    return Number(((priceKg / 1000) * grams).toFixed(2));

}

function calculateRecipeCost(recipe) {

    let totalCost = 0;

    const ingredients = recipe.ingredients.map(item => {

        const ingredientCost = calculateIngredientCost(
            item.ingredient.priceKg,
            item.quantity
        );

        totalCost += ingredientCost;

        return {

            ...item.toObject(),

            cost: ingredientCost

        };

    });

    return {

        ...recipe.toObject(),

        ingredients,

        totalCost: Number(totalCost.toFixed(2))

    };

}

module.exports = {

    calculateIngredientCost,

    calculateRecipeCost

};