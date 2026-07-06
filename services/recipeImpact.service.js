const { Cake } = require("../models/cake");
const costService = require("./cost.service");

async function calculateImpact(ingredientId, oldPrice, newPrice) {

    const recipes = await Cake.find({
        "ingredients.ingredient": ingredientId
    }).populate({
        path: "ingredients.ingredient",
        select: "name priceKg"
    });

    const affectedRecipes = [];

    for (const recipe of recipes) {

        const oldRecipe = recipe.toObject();

        // costo con precio viejo
        oldRecipe.ingredients = oldRecipe.ingredients.map(item => {

            if (item.ingredient._id.toString() === ingredientId.toString()) {
                item.ingredient.priceKg = oldPrice;
            }

            return item;
        });

        const previous = costService.calculateRecipeCost(oldRecipe);

        // costo con precio nuevo
        const current = costService.calculateRecipeCost(recipe);

        affectedRecipes.push({

            recipeId: recipe._id,

            recipeName: recipe.name,

            previousCost: previous.totalCost,

            currentCost: current.totalCost,

            difference: Number(
                (current.totalCost - previous.totalCost).toFixed(2)
            )

        });

    }

    return affectedRecipes;

}

module.exports = {
    calculateImpact
};