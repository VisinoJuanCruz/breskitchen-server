const { Cake } = require("../models/cake");

const findAll = () => {
    return Cake.find()
        .populate({
            path: "ingredients.ingredient",
            select: "name unitPrice unit"
        })
        .sort({ name: 1 });
};

const findAllOffers = () => {
    return Cake.find({ ofer: true })
        .populate({
            path: "ingredients.ingredient",
            select: "name unitPrice unit"
        })
        .sort({ name: 1 });
};

const findById = (id) => {
    return Cake.findById(id)
        .populate({
            path: "ingredients.ingredient",
            select: "name unitPrice unit"
        });
};

module.exports = {
    findAll,
    findAllOffers,
    findById
};