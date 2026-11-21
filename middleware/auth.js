
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authToken = req.cookies?.authToken;

    if (!authToken) {
        return res.status(401).json({
            success: false,
            error: "No token provided"
        });
    }

    try {
        const decodedToken = jwt.verify(
            authToken,
            process.env.JWT_SECRET
        );

        req.user = decodedToken;

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Invalid token"
        });
    }
};

module.exports = authMiddleware;
