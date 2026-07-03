const ingredientHistoryRepository = require("../repositories/ingredientPriceHistory.repository");

const createHistory = async ({
    ingredientId,
    previousPrice,
    newPrice,
    brand = "",
    supplier = "",
    note = "",
}) => {

    return ingredientHistoryRepository.create({
        ingredient: ingredientId,
        previousPrice,
        newPrice,
        brand,
        supplier,
        note,
    });

};

module.exports = {
    createHistory,
};