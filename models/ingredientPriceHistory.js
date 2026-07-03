const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ingredientPriceHistorySchema = new Schema(
    {
        ingredient: {
            type: Schema.Types.ObjectId,
            ref: "Ingredient",
            required: true
        },

        previousPrice: {
            type: Number,
            required: true
        },

        newPrice: {
            type: Number,
            required: true
        },

        brand: {
            type: String,
            default: ""
        },

        supplier: {
            type: String,
            default: ""
        },

        note: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const IngredientPriceHistory = mongoose.model(
    "IngredientPriceHistory",
    ingredientPriceHistorySchema,
    "IngredientPriceHistory"
);

module.exports = { IngredientPriceHistory };