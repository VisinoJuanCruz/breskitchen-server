const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const PORT = 3000
//const PORT = process.env.PORT ;
const dbConnect = require("./db/connect")


const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const JWT_SECRET = 'teamamos'; 
const ingredientsRoutes = require('./routes/ingredient')
const cakesRoutes = require('./routes/cake')
const { User } = require("./models/user");

const cors = require('cors');
dbConnect()

//Configurar ROUTERS 
app.use("/api/cakes", cakesRoutes)
app.use("api/ingredients", ingredientsRoutes)


//Así agrego un nuevo atributo a los viejos elementos existentes
//Cake.updateMany({category:"torta"}).exec(); 

//Middlewares

app.use(express.json());
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173', // Cambia esto al origen correcto de tu aplicación frontend
  credentials: true,
}));
app.use(cookieParser());

app.use(
  session({
    secret: 'teamamos',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'none', // o cambia a 'none' en producción según lo necesites
      secure: true, // Cambia a true en producción si estás usando HTTPS
      maxAge: 24 * 60 * 60 * 1000, // Duración de la cookie en milisegundos (1 día)
    },
  })
);


//ROUTES

app.get('/api/check-auth', (req, res) => {
  // Comprueba si el usuario está autenticado a través de alguna lógica
  // Puedes usar el token JWT que se almacena en la cookie para esta verificación

  // Obtén el token JWT de las cookies
  const authToken = req.cookies.authToken;
  console.log("TOKEN QUE LLEGA AL BACK:", authToken)
 

  if (authToken) {
    try {
      // Verifica el token JWT utilizando tu clave secreta (la misma que usaste al firmar el token)
      const decodedToken = jwt.verify(authToken, JWT_SECRET);
      console.log(decodedToken)
      console.log('teamamos')
      // Si la verificación es exitosa, el usuario está autenticado
      res.json({ success: true, username: decodedToken.username });
    } catch (error) {
      // Si la verificación falla, el usuario no está autenticado
      res.json({ success: false });
    }
  } else {
    // Si no hay un token en las cookies, el usuario no está autenticado
    res.json({ success: false });
  }
});
// Ruta para iniciar sesión

// Ruta para iniciar sesión
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar el usuario por nombre de usuario en la base de datos
    const user = await User.findOne({ username });

    // Verificar si se encontró el usuario
    if (user) {
      // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // La autenticación fue exitosa
        // Generar un token JWT (JSON Web Token)
        const token = jwt.sign({ username: user.username }, JWT_SECRET, {
          expiresIn: '1d', // El token expirará en 1 día
        });

        // Establecer la cookie con el token en la respuesta
        
        res.cookie('authToken', token, {
          httpOnly: true,
          sameSite: 'none', // Configurar SameSite como "None"
          secure: true, // Solo se enviará la cookie en conexiones HTTPS
          maxAge: 24 * 60 * 60 * 1000, // Duración de la cookie en milisegundos (1 día)
        });

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


// Ruta para cerrar sesión
app.post('/api/logout', (req, res) => {
  // Eliminar la cookie de autenticación
  res.clearCookie('authToken');
  res.json({ success: true });
});


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

app.listen(PORT, () => {
    console.log(`Breskitchen server is running on port ${PORT}`);
    
})
