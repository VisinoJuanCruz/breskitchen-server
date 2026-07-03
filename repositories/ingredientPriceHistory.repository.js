const {
    IngredientPriceHistory,
} = require("../models/ingredientPriceHistory");

const create = (historyData) => {
    return IngredientPriceHistory.create(historyData);
};

const findByIngredient = (ingredientId) => {
    return IngredientPriceHistory
        .find({ ingredient: ingredientId })
        .sort({ createdAt: -1 });
};

module.exports = {
    create,
    findByIngredient,
};