const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    priceKg: { type: Number, default: 0 }
    })

const Ingredient = mongoose.model('Ingredient', ingredientSchema, "Ingredients");

module.exports = {Ingredient}