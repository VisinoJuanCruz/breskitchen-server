const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cakeSchema = new Schema({

    // Información general
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },

    // Precio de venta
    price: { type: Number, required: true },
    discountRate: { type: Number, default: 0 },
    ofer: { type: Boolean, required: true },

    // Imagen
    image: { type: String, required: true },

    // Ingredientes
    ingredients: [
        {
            ingredient: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredient",
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],

    // Rendimiento de la receta
    yieldQuantity: {
        type: Number,
        default: 1,
    },

    yieldUnit: {
        type: String,
        enum: ["unidad", "porción", "kg", "g", "docena"],
        default: "unidad",
    },

    yieldName: {
        type: String,
        default: "",
    },

}, {
    timestamps: true,
});

const Cake = mongoose.model(
    "Cake",
    cakeSchema,
    "Cakes"
);

module.exports = { Cake };