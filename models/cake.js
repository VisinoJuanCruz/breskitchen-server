const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const cakeSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    ofer: { type: Boolean, required: true },
    image: { type: String, required: true },
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ingredient',
        },
        quantity: { type: Number, required: true },
      },
    ],
    discountRate: { type: Number, default: 0 }, // Agrega la propiedad discountRate
    category: { type: String , required: true},
  });
  
  const Cake = mongoose.model('Cake', cakeSchema, "Cakes");

  module.exports = {Cake};