
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const ingredientRoutes = require("./routes/ingredient");
const cakeRoutes = require("./routes/cake");
const authRoutes = require("./routes/auth");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// --------------------------------------------------
// VALIDACIÓN DE VARIABLES DE ENTORNO
// --------------------------------------------------

const validateEnvironment = () => {
    const requiredVariables = [
        "USERDATABASE",
        "PASSWORDDATABASE",
        "JWT_SECRET",
        "SESSION_SECRET"
    ];

    const missingVariables = requiredVariables.filter(
        (variable) => !process.env[variable]?.trim()
    );

    if (missingVariables.length > 0) {
        console.error(
            "Error: faltan variables de entorno obligatorias:",
            missingVariables.join(", ")
        );

        process.exit(1);
    }

    const secrets = ["JWT_SECRET", "SESSION_SECRET"];

    for (const secret of secrets) {
        if (process.env[secret].length < 32) {
            console.error(
                `Error: ${secret} debe tener al menos 32 caracteres.`
            );

            process.exit(1);
        }
    }

    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
        console.error("Error: PORT tiene un valor inválido.");
        process.exit(1);
    }

    console.log("Variables de entorno validadas correctamente.");
};

// --------------------------------------------------
// MIDDLEWARES
// --------------------------------------------------

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://rosybrown-lyrebird-865308.hostingersite.com"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// --------------------------------------------------
// RUTAS
// --------------------------------------------------

app.use("/api", authRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/cakes", cakeRoutes);

// --------------------------------------------------
// INICIO DEL SERVIDOR
// --------------------------------------------------

const startServer = async () => {
    validateEnvironment();

    try {
        const MONGODB_URI =
            `mongodb+srv://${process.env.USERDATABASE}:${process.env.PASSWORDDATABASE}` +
            `@breskitchencluster.hqmk53c.mongodb.net/${process.env.MONGODB_DATABASE}`;

        await mongoose.connect(MONGODB_URI);

        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

startServer();
