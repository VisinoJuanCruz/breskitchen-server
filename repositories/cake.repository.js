const { Cake } = require("../models/cake");

const findAll = () => {
    return Cake.find()
        .populate({
            path: "ingredients.ingredient",
            select: "name priceKg"
        })
        .sort({ name: 1 });
};

const findAllOffers = () => {
    return Cake.find({ ofer: true })
        .populate({
            path: "ingredients.ingredient",
            select: "name priceKg"
        })
        .sort({ name: 1 });
};

const findById = (id) => {
    return Cake.findById(id)
        .populate({
            path: "ingredients.ingredient",
            select: "name priceKg"
        });
};

module.exports = {
    findAll,
    findAllOffers,
    findById
};