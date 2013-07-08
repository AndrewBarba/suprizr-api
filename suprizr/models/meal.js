var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var MealSchema = BaseSchema.extend({
    name: String,
    description: String,
    health: { type: Number, index: true }, // number between 0 - 1 indicating health. 0 = healthy
    restaurant: { type: String, ref: "Restaurant" },
    num_orders: Number, // number of times this meal was ordered
    price: Number, // Restaurants meal price
    ingredients: {
        gluten_free: Boolean,
        dairy_free: Boolean,
        peanut_free: Boolean,
        meat_free: Boolean
    }
});

MealSchema.statics.create = function(data, callback) {
    var doc = new Meal();
    doc.putData(data, callback);
}

var Meal = mongoose.model("Meal", MealSchema);
module.exports = Meal;