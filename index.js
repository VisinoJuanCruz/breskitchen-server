const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

const bcrypt = require('bcrypt');

const PORT = 3000
//const PORT = process.env.PORT ;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cors = require('cors');



const MONGODB_URL= `mongodb+srv://breskitchen:bMuyQABRw34DhEeo@breskitchencluster.hqmk53c.mongodb.net/`

mongoose.connect(MONGODB_URL).then(()=>{
    console.log('Connected to MongoDB');

})

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
});

const Cake = mongoose.model('Cake', cakeSchema, "Cakes");

const ingredientSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    priceKg: { type: Number, default: 0 }
    })

const Ingredient = mongoose.model('Ingredient', ingredientSchema, "Ingredients");

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema, "Users");



//Middlewares
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));


//ROUTES

app.post('/api/add-user', async (req, res) => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username: 'breskitchen' });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear un hash de la contraseña antes de almacenarla
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('teamamos', saltRounds);

    // Crear un nuevo usuario
    const newUser = new User({
      username: 'breskitchen',
      password: hashedPassword,
    });

    // Guardar el usuario en la base de datos
    await newUser.save();

    res.status(201).json({ message: 'Usuario agregado con éxito' });
  } catch (error) {
    console.error('Error al agregar el usuario', error);
    res.status(500).json({ error: 'Error al agregar el usuario' });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(password)

  try {
    // Buscar el usuario por nombre de usuario en la base de datos
    const user = await User.findOne({ username });

    // Verificar si se encontró el usuario
    if (user) {
      // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
      const passwordMatch = bcrypt.compareSync(password, user.password);
      
      if (passwordMatch) {
        // La autenticación fue exitosa
        res.json({ success: true });
      } else {
        // La autenticación falló debido a contraseñas no coincidentes
        res.json({ success: false, error: 'Contraseña incorrecta' });
      }
    } else {
      // El usuario no fue encontrado
      res.json({ success: false, error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
});


// Define una ruta para obtener todas las tortas con información de ingredientes populada
app.get('/api/cakes', async (req, res) => {
  try {
    const cakes = await Cake.find()
      .populate({
        path: 'ingredients.ingredient',
        select: 'name priceKg', // Incluye los campos 'name' y 'priceKg' del ingrediente
      })
      .sort({name:1})
      .exec();

    res.json(cakes); // Devuelve las tortas con información de ingredientes populada en formato JSON como respuesta
  } catch (error) {
    console.error('Error al obtener las tortas', error);
    res.status(500).json({ error: 'Error al obtener las tortas' });
  }
});

app.get('/api/ofer-cakes', async (req, res) => {
  try {
    const cakes = await Cake.find({ofer:'true'})
      .populate({
        path: 'ingredients.ingredient',
        select: 'name priceKg', // Incluye los campos 'name' y 'priceKg' del ingrediente
      })
      .sort({name:1})
      .exec();

    res.json(cakes); // Devuelve las tortas con información de ingredientes populada en formato JSON como respuesta
  } catch (error) {
    console.error('Error al obtener las tortas', error);
    res.status(500).json({ error: 'Error al obtener las tortas' });
  }
});

app.get("/api/ingredients", async (req, res) => {
    Ingredient.find().sort({name:1}).then((ingredients)=>{
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

// Ruta para actualizar el precio de un ingrediente por su ID
app.put('/api/ingredients/updatePrice/:id', async (req, res) => {
  const ingredientId = req.params.id;
  const newPriceKg = req.body.priceKg; // Nuevo precio por kilo enviado en el cuerpo de la solicitud

  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      ingredientId,
      { priceKg: newPriceKg },
      { new: true } // Para obtener la versión actualizada del ingrediente
    );

    if (!updatedIngredient) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    res.json(updatedIngredient);
  } catch (error) {
    console.error('Error al actualizar el precio del ingrediente', error);
    res.status(500).json({ error: 'Error al actualizar el precio del ingrediente' });
  }
});

// Ruta para actualizar el nombre de un ingrediente por su ID
app.put('/api/ingredients/updateName/:id', async (req, res) => {
  const ingredientId = req.params.id;
  const newName = req.body.name; // Nuevo nombre enviado en el cuerpo de la solicitud

  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      ingredientId,
      { name: newName },
      { new: true } // Para obtener la versión actualizada del ingrediente
    );

    if (!updatedIngredient) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    res.json(updatedIngredient);
  } catch (error) {
    console.error('Error al actualizar el nombre del ingrediente', error);
    res.status(500).json({ error: 'Error al actualizar el nombre del ingrediente' });
  }
});




// Ruta para actualizar una receta por su ID
app.put('/api/cakes/:id', async (req, res) => {
  const cakeId = req.params.id;
  const updatedCakeData = req.body; // Los nuevos datos de la receta

  try {
    const updatedCake = await Cake.findByIdAndUpdate(
      cakeId,
      updatedCakeData,
      { new: true } // Para obtener la versión actualizada de la receta
    );

    if (!updatedCake) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    res.json(updatedCake);
  } catch (error) {
    console.error('Error al actualizar la receta', error);
    res.status(500).json({ error: 'Error al actualizar la receta' });
  }
});


// En tu archivo de rutas en el backend (puede variar según tu estructura de archivos)
app.get('/api/cakes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la receta por ID en la base de datos
    const recipe = await Cake.findById(id)
      .populate({
        path: 'ingredients.ingredient',
        select: 'name priceKg', // Incluir los campos 'name' y 'priceKg' del ingrediente
      })
      .exec();

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    res.json(recipe); // Devolver los detalles de la receta en formato JSON
  } catch (error) {
    console.error('Error al obtener los detalles de la receta', error);
    res.status(500).json({ error: 'Error al obtener los detalles de la receta' });
  }
});

// Ruta para eliminar un ingrediente por su ID
app.delete('/api/ingredients/:id', async (req, res) => {
  const ingredientId = req.params.id;

  try {
    const deletedIngredient = await Ingredient.findByIdAndRemove(ingredientId);

    if (!deletedIngredient) {
      return res.status(404).json({ error: 'Ingrediente no encontrado' });
    }

    res.json({ message: 'Ingrediente eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el ingrediente', error);
    res.status(500).json({ error: 'Error al eliminar el ingrediente' });
  }
});

// Ruta para eliminar una receta por su ID
app.delete('/api/cakes/:id', async (req, res) => {
  const cakeId = req.params.id;

  try {
    const deletedCake = await Cake.findByIdAndRemove(cakeId);

    if (!deletedCake) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    res.json({ message: 'Receta eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar la receta', error);
    res.status(500).json({ error: 'Error al eliminar la receta' });
  }
});




app.listen(PORT, () => {
    console.log(`Breskitchen server is running on port ${PORT}`);
    
})
