const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

const PORT = 3000
//const PORT = process.env.PORT ;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cors = require('cors');



const MONGODB_URL= `mongodb+srv://breskitchen:bMuyQABRw34DhEeo@breskitchencluster.hqmk53c.mongodb.net/`

mongoose.connect(MONGODB_URL).then(()=>{
    console.log('Connected to MongoDB');

})

const cakeSchema= new Schema({
    name: { type: String, required: true },
    description:{ type: String, required: true },
    price : { type: Number, required: true },
    ofer : { type: Boolean, required: true },
    image : { type: String, required: true },
    ingredients: [
      {
        ingredient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ingredient'
        },
        quantity:{ type: Number, required: true } // Agregar el campo "quantity" para almacenar la cantidad de cada ingrediente
      }
    ],})

const Cake = mongoose.model('Cake', cakeSchema, "Cakes");

const ingredientSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    priceKg: { type: Number, default: 0 }
    })

const Ingredient = mongoose.model('Ingredient', ingredientSchema, "Ingredients");





//Middlewares
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));


//ROUTES


// Define una ruta para obtener todas las tortas con información de ingredientes populada
app.get('/api/cakes', async (req, res) => {
  try {
    const cakes = await Cake.find()
      .populate({
        path: 'ingredients.ingredient',
        select: 'name priceKg', // Incluye los campos 'name' y 'priceKg' del ingrediente
      })
      .exec();

    res.json(cakes); // Devuelve las tortas con información de ingredientes populada en formato JSON como respuesta
  } catch (error) {
    console.error('Error al obtener las tortas', error);
    res.status(500).json({ error: 'Error al obtener las tortas' });
  }
});

app.get("/api/ingredients", async (req, res) => {
    Ingredient.find().then((ingredients)=>{
        res.status(200).json(ingredients)
    })
})

app.post("/api/ingredients", async (req, res) => {
    const ingredient = req.body
    
    Ingredient.create({
        name:ingredient.name,
        priceKg:ingredient.priceKg,
        quantity:ingredient.quantity,
    
    }).then((createdIngredient)=>{
        console.log("Cargando: ", ingredient)
        res.status(201).json(createdIngredient)
    })
})

app.post("/api/cakes", async (req, res) => {
  const cake = req.body;
  console.log(cake);
  
  const ingredientsIds = cake.ingredients.map((ingredient) => {
    if (/^[0-9a-fA-F]{24}$/.test(ingredient.ingredientId)) {
      return new mongoose.Types.ObjectId(ingredient.ingredientId);
    } else {
      // Manejar el caso en el que ingredientId no sea válido (por ejemplo, mostrar un error).
      return null; // O cualquier otra acción adecuada en tu aplicación
    }
  });
  
  // Filtra los elementos nulos en caso de que algunos ingredientId no sean válidos
  const validIngredientsIds = ingredientsIds.filter((id) => id !== null);
  
  Cake.create({
    name: cake.name,
    description: cake.description,
    price: cake.price,
    ofer: cake.ofer,
    image: cake.image,
    ingredients: cake.ingredients.map((ingredientData) => ({
      ingredient: ingredientData.ingredient,
      quantity: ingredientData.quantity
    })),
  }).then((createdCake) => {
    console.log("Cargando:", cake);
    console.log("Objeto Cake creado:", createdCake); // Agrega esta línea para verificar el objeto Cake creado
    res.status(201).json(createdCake);
  }).catch((error) => {
    console.error("Error al crear el pastel:", error);
    res.status(500).json({ error: "Error al crear el pastel" });
  });
})
  
/*



app.post("/api/recipes", async (req, res) => {
    const recipe = req.body
    
    Recipe.create({
        name:recipe.name,
        difficulty:recipe.difficulty,
        ingredients:recipe.ingredients,
    
    }).then((createdRecipe)=>{
        res.status(201).json(createdRecipe)
    })
}
)

app.patch('/api/products/:productId', async (req, res) => {
    
    const { productId } = req.params;
    const { action } = req.body;
    
  
    try {
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado.' });
      }
  
      if (action === 'increment') {
        product.quantity += 1;
        console.log(`Agregando ${product.name}`)
      } else if (action === 'decrement') {
        if (product.quantity > 0) {
          product.quantity -= 1;
          console.log(`Quitando ${product.name}`)
        }
      }
  
      await product.save();
  
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar la cantidad del producto.' });
    }})




app.delete("/api/moves/:id", async (req, res) => {
    const id = req.params.id
   

    //Delete move and actualize Person 
    Move.findByIdAndDelete(id).then((deletedMove)=>{
        Person.findOne({name:deletedMove.name}).then((person)=>{
            person.spent = person.spent - deletedMove.spent
            person.owe = person.owe - deletedMove.owe
            person.save()
        
            res.status(200).json(person)
        


                 
    

    })
})

    
});

app.post("/api/personas/reset", async (req, res) => {

    const personUpdate = req.body;
    console.log("ME LLEGA ESTO DEL FRONT:",personUpdate)
    Person.updateMany({ $set: { spent: 0, owe: 0 } }) .
        then((updatedPersons) => {
            console.log("Updated persons:", updatedPersons);
        }
        ).then(() => {


        try {
            const updatedPerson = Person
            .findByIdAndUpdate(personUpdate.id, {
              $inc: { 
                  spent: parseInt(personUpdate.spent),
                   owe: parseInt(personUpdate.owe) },
            });
        
            console.log("Finish update");
            res.status(200).json(updatedPerson);
          } catch (error) {
            console.error("Error al actualizar los valores:", error);
            res.status(500).json({ error: "Error al actualizar los valores" });
          }})
});



        
    


app.post("/api/personas", async (req, res) => {
    const person = req.body
    console.log(person.name)
    
    Person.create({
        name:person.name,
        spent:person.spent,
        owe:person.owe,
    
    }).then((createdPerson)=>{
        res.status(201).json(createdPerson)
    })
})

app.post("/api/personas", async (req, res) => {
    const person = req.body
    console.log(person,"NUEVO MOVIMIENTO")
    
    Move.create({
        name:person.name,
        spent:0,
        owe:0,
        motive:person.motive,
        date: new Date()
    
    }).then((createdMove)=>{
        res.status(201).json(createdMove)
    })
})

app.put("/api/personas/", async (req, res) => {
    const person = req.body;
  
    Move.create({
        name:person.name,
        spent:person.spent,
        owe:person.owe,
        motive:person.motive,
        date: new Date()

    

    })

    try {
      const updatedPerson = await Person
      .findByIdAndUpdate(person.id, {
        $inc: { 
            spent: parseInt(person.spent),
             owe: parseInt(person.owe) },
      });
  
      console.log("Finish update");
      res.status(200).json(updatedPerson);
    } catch (error) {
      console.error("Error al actualizar los valores:", error);
      res.status(500).json({ error: "Error al actualizar los valores" });
    }
  });

*/


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
})
