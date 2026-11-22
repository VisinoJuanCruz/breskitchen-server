
const {
    calculateIngredientCost,
    convertToBaseUnit,
} = require("./cost.service");

console.log("=================================");
console.log(" PRUEBAS DEL SERVICIO DE COSTOS");
console.log("=================================\n");

// 1. Harina: compra por kg, receta en gramos
console.log("1. Harina: 500 g a $1500/kg");
console.log(
    "Resultado:",
    calculateIngredientCost(1500, 500, "g", "kg")
);
console.log("Esperado: 750\n");

// 2. Harina: compra por kg, receta en kg
console.log("2. Harina: 0.5 kg a $1500/kg");
console.log(
    "Resultado:",
    calculateIngredientCost(1500, 0.5, "kg", "kg")
);
console.log("Esperado: 750\n");

// 3. Leche: compra por litro, receta en ml
console.log("3. Leche: 200 ml a $1200/l");
console.log(
    "Resultado:",
    calculateIngredientCost(1200, 200, "ml", "l")
);
console.log("Esperado: 240\n");

// 4. Leche: compra por litro, receta en litros
console.log("4. Leche: 0.5 l a $1200/l");
console.log(
    "Resultado:",
    calculateIngredientCost(1200, 0.5, "l", "l")
);
console.log("Esperado: 600\n");

// 5. Huevos: compra por unidad
console.log("5. Huevos: 3 unidades a $250/unidad");
console.log(
    "Resultado:",
    calculateIngredientCost(250, 3, "unidad", "unidad")
);
console.log("Esperado: 750\n");

// 6. Conversión directa
console.log("6. Convertir 500 g a kg");
console.log(
    "Resultado:",
    convertToBaseUnit(500, "g", "kg")
);
console.log("Esperado: 0.5\n");

// 7. Conversión inversa
console.log("7. Convertir 2 kg a g");
console.log(
    "Resultado:",
    convertToBaseUnit(2, "kg", "g")
);
console.log("Esperado: 2000\n");

// 8. Conversión incompatible
console.log("8. Intentar convertir ml a kg");

try {
    calculateIngredientCost(1500, 500, "ml", "kg");
    console.log("ERROR: Se permitió una conversión incompatible");
} catch (error) {
    console.log("Resultado esperado:", error.message);
}

// 9. Precio cero
console.log("\n9. Ingrediente con precio cero");
console.log(
    "Resultado:",
    calculateIngredientCost(0, 500, "g", "kg")
);
console.log("Esperado: 0");

console.log("\n=================================");
console.log(" FIN DE LAS PRUEBAS");
console.log("=================================");
