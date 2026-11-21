
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET;

const checkAuth = (req, res) => {
    const authToken = req.cookies.authToken;

    if (!authToken) {
        return res.status(401).json({ success: false });
    }

    try {
        const decodedToken = jwt.verify(authToken, JWT_SECRET);

        return res.json({
            success: true,
            username: decodedToken.username,
        });
    } catch (error) {
        return res.status(401).json({ success: false });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Usuario o contraseña incorrectos",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                error: "Usuario o contraseña incorrectos",
            });
        }

        const token = jwt.sign(
            { username: user.username },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("authToken", token, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true });

    } catch (error) {
        console.error("Error de autenticación:", error);

        return res.status(500).json({
            success: false,
            error: "Error de autenticación",
        });
    }
};

const logout = (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });

    return res.json({ success: true });
};

module.exports = {
    checkAuth,
    login,
    logout,
};
