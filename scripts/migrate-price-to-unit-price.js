db.Ingredients.updateMany(
  {},
  [
    {
      $set: {
        unitPrice: "$priceKg"
      }
    },
    {
      $unset: "priceKg"
    }
  ]
)