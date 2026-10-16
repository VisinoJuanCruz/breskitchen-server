const parseRecipeData = (req, res, next) => {
    try {
        if (typeof req.body.ingredients === "string") {
            req.body.ingredients = JSON.parse(req.body.ingredients);
        }

        next();
    } catch (error) {
        return res.status(400).json({
            error: "Invalid ingredients format"
        });
    }
};

module.exports = parseRecipeData;