const requireImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            error: "Image is required"
        });
    }

    next();
};

module.exports = requireImage;