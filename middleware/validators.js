const { body, param, validationResult } = require('express-validator');

/**
 * Función middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validadores para autenticación
 */
const loginValidators = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

/**
 * Validadores para Ingredientes
 */
const createIngredientValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ingredient name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-áéíóúÁÉÍÓÚ]+$/)
    .withMessage('Ingredient name can only contain letters, spaces, and hyphens'),
  body('quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('priceKg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price per kg must be a positive number'),
];

const updateIngredientPriceValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ingredient ID'),
  body('priceKg')
    .isFloat({ min: 0 })
    .withMessage('Price per kg must be a positive number'),
];

const updateIngredientNameValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ingredient ID'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ingredient name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-áéíóúÁÉÍÓÚ]+$/)
    .withMessage('Ingredient name can only contain letters, spaces, and hyphens'),
];

const deleteIngredientValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ingredient ID'),
];

/**
 * Validadores para Cakes (Recetas)
 */
const createCakeValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cake name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('ofer')
    .isBoolean()
    .withMessage('ofer must be a boolean'),
  body('carousel')
    .isBoolean()
    .withMessage('carousel must be a boolean'),
  body('outstanding')
    .isBoolean()
    .withMessage('outstanding must be a boolean'),
  body('category')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('image')
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required')
    .custom((ingredients) => {
      ingredients.forEach((ing) => {
        if (!ing.ingredient || typeof ing.quantity !== 'number' || ing.quantity <= 0) {
          throw new Error('Each ingredient must have a valid ID and positive quantity');
        }
      });
      return true;
    }),
];

const updateCakeValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cake ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Cake name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
];

const updateCakePriceValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cake ID'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
];

const getCakeByIdValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cake ID'),
];

const deleteCakeValidators = [
  param('id')
    .isMongoId()
    .withMessage('Invalid cake ID'),
];

module.exports = {
  handleValidationErrors,
  loginValidators,
  createIngredientValidators,
  updateIngredientPriceValidators,
  updateIngredientNameValidators,
  deleteIngredientValidators,
  createCakeValidators,
  updateCakeValidators,
  updateCakePriceValidators,
  getCakeByIdValidators,
  deleteCakeValidators,
};
