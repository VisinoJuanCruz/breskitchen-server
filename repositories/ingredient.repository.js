const { Ingredient } = require("../models/ingredient");

const findById = (id) => {
    return Ingredient.findById(id);
};

const save = (ingredient) => {
    return ingredient.save();
};

module.exports = {
    findById,
    save
};