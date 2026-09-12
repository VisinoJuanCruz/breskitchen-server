const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({

    // Nombre
    name: {
        type: String,
        required: true,
        trim: true
    },

    // Unidad de compra
    unit: {
        type: String,
        enum: ["kg", "g", "l", "ml", "unidad"],
        default: "kg"
    },

    // Stock disponible
    stock: {
        type: Number,
        default: 0
    },

    // Stock mínimo
    minStock: {
        type: Number,
        default: 0
    },

    // Precio actual
    unitPrice: {
        type: Number,
        default: 0
    },

    // Marca habitual
    defaultBrand: {
        type: String,
        default: ""
    },

    // Proveedor habitual
    defaultSupplier: {
        type: String,
        default: ""
    },

    // Observaciones
    note: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
});

const Ingredient = mongoose.model(
    "Ingredient",
    ingredientSchema,
    "Ingredients"
);

module.exports = { Ingredient };