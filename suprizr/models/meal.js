var BaseSchema = require("./base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var meal_fields = {
    name: String,
    ingredients: [String],
    health: Number, // number between 0 - 1 indicating health. 0 = healthy
    restaurant: { type: String, ref: "Restaurant" },
    num_orders: Number // number of times this meal was ordered
};

var MealSchema = BaseSchema.extend(meal_fields);

module.exports = mongoose.model("Meal", MealSchema);