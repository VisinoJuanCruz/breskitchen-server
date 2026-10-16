/**
 * Script de Migración: Agregar field 'stage' a Cake.ingredients
 * 
 * Propósito: Añadir el campo 'stage' a todos los ingredientes existentes
 * con el valor por defecto "default" para mantener backward compatibility.
 * 
 * Uso: node scripts/add-stages-to-ingredients.js
 * 
 * Ejecutar desde el directorio Breskitchen-server
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Conectar a MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ Error: MONGO_URI no está configurado en .env");
  process.exit(1);
}

async function runMigration() {
  try {
    console.log("🔄 Conectando a MongoDB...");
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");

    // Usar la conexión directa de MongoDB para hacer bulkWrite
    const db = mongoose.connection.db;
    const cakesCollection = db.collection("Cakes");

    console.log("🔄 Analizando documentos...");

    // Contar documentos que necesitan migración
    const docsNeedingMigration = await cakesCollection.countDocuments({
      "ingredients.stage": { $exists: false },
    });

    console.log(`📊 Documentos a actualizar: ${docsNeedingMigration}`);

    if (docsNeedingMigration === 0) {
      console.log("✅ Ya todos los documentos tienen el campo 'stage'");
      process.exit(0);
    }

    // Actualizar todos los documentos que no tienen 'stage'
    console.log("🔄 Ejecutando migración...");
    const result = await cakesCollection.updateMany(
      { "ingredients.stage": { $exists: false } },
      [
        {
          $set: {
            ingredients: {
              $map: {
                input: "$ingredients",
                as: "ing",
                in: {
                  ingredient: "$$ing.ingredient",
                  quantity: "$$ing.quantity",
                  stage: "default", // Agregar stage con valor default
                },
              },
            },
          },
        },
      ]
    );

    console.log("✅ Migración completada:");
    console.log(`   - Documentos matched: ${result.matchedCount}`);
    console.log(`   - Documentos modificados: ${result.modifiedCount}`);

    // Verificación post-migración
    console.log("🔍 Verificando resultado...");
    const updatedDocs = await cakesCollection
      .find({ ingredients: { $exists: true } })
      .limit(3)
      .toArray();

    if (updatedDocs.length > 0) {
      console.log("📋 Muestra de documento actualizado:");
      const firstCake = updatedDocs[0];
      console.log(`   Nombre: ${firstCake.name || "N/A"}`);
      if (firstCake.ingredients && firstCake.ingredients.length > 0) {
        console.log(`   Ingredientes: ${firstCake.ingredients.length}`);
        console.log(`   Primer ingrediente:`, {
          ingredient: firstCake.ingredients[0].ingredient,
          quantity: firstCake.ingredients[0].quantity,
          stage: firstCake.ingredients[0].stage || "missing",
        });
      }
    }

    console.log("✅ Migración finalizada exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("🔌 Desconectado de MongoDB");
    }
  }
}

// Ejecutar migración
runMigration();
