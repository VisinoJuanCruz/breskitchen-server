const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const ingredientRoutes = require("./routes/ingredient");
const cakeRoutes = require("./routes/cake");
const authRoutes = require("./routes/auth");

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect(
    `mongodb+srv://${process.env.USERDATABASE}:${process.env.PASSWORDDATABASE}@breskitchencluster.hqmk53c.mongodb.net/develop`
).then(() => {
    console.log("Connected to MongoDB");
});

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

app.use("/api", authRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/cakes", cakeRoutes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en ${PORT}`);
});