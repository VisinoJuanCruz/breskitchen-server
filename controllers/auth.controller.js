const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET;

const checkAuth = (req, res) => {

    const authToken = req.cookies.authToken;

    if (!authToken) {
        return res.json({ success: false });
    }

    try {

        const decodedToken = jwt.verify(authToken, JWT_SECRET);

        res.json({

            success: true,
            username: decodedToken.username

        });

    } catch (error) {

        console.error(error);

        res.json({ success: false });

    }

};

const login = async (req, res) => {

    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username });

        if (!user) {

            return res.json({

                success: false,
                error: "Usuario no encontrado"

            });

        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {

            return res.json({

                success: false,
                error: "Contraseña incorrecta"

            });

        }

        const token = jwt.sign(

            {
                username: user.username
            },

            JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.cookie("authToken", token, {

            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000

        });

        res.json({

            success: true

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error de autenticación"

        });

    }

};

const logout = (req, res) => {

    res.clearCookie("authToken", {

        httpOnly: true,
        sameSite: "None",
        secure: true

    });

    res.json({

        success: true

    });

};

const addUser = async (req, res) => {

    try {

        const existingUser = await User.findOne({

            username: "breskitchen"

        });

        if (existingUser) {

            return res.status(400).json({

                error: "El usuario ya existe"

            });

        }

        const hashedPassword = await bcrypt.hash(

            "teamamos",
            10

        );

        const newUser = await User.create({

            username: "breskitchen",

            password: hashedPassword

        });

        res.status(201).json({

            message: "Usuario agregado con éxito",

            user: newUser

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error: "Error al agregar usuario"

        });

    }

};

module.exports = {

    checkAuth,
    login,
    logout,
    addUser

};