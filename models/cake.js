const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cakeSchema = new Schema(
  {
    // Información general
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Precio de venta
    price: {
      type: Number,
      required: true,
    },

    discountRate: {
      type: Number,
      default: 0,
    },

    ofer: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Imagen
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      default: null,
    },

    // Presentación en la web
    carousel: {
      type: Boolean,
      default: false,
    },

    outstanding: {
      type: Boolean,
      default: false,
    },

    // Ingredientes
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ingredient",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 0,
        },

        stage: {
          type: String,

          enum: [
            "masa",
            "bizcochuelo",
            "relleno",
            "salsa",
            "cobertura",
            "decoracion",
            "terminacion",
            "otro",
            "default",
          ],
          default: "default",
          index: true,
        },
      },
    ],

    // Rendimiento de la receta
    yieldQuantity: {
      type: Number,
      default: 1,
      min: 1,
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
  },
  {
    timestamps: true,
  },
);

const Cake = mongoose.model("Cake", cakeSchema, "Cakes");

module.exports = { Cake };
