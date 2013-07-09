var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var MealSchema = BaseSchema.extend({
    name: String,
    description: String,
    health: { type: Number, index: true }, // number between 0 - 1 indicating health. 0 = healthy
    restaurant: { type: String, ref: "Restaurant", index: true },
    num_orders: Number, // number of times this meal was ordered
    price: Number, // Restaurants meal price
    ingredients: {
        gluten_free: { type: Boolean, index: true },
        dairy_free: { type: Boolean, index: true },
        peanut_free: { type: Boolean, index: true },
        meat_free: { type: Boolean, index: true }
    }
});

MealSchema.statics.create = function(data, callback) {
    var doc = new Meal();
    doc.putData(data, callback);
}

MealSchema.statics.findForOrder = function(restaurant_ids, meal, callback) {
    var min_health = Math.max(meal.health - 0.2, 0);
    var meal_query = {
        "restaurant" : { "$in" : restaurant_ids },
        "health" : { "$gte" : min_health, "$lte" : meal.health },
        "ingredients.gluten_free" : meal.ingredients.gluten_free,
        "ingredients.dairy_free" : meal.ingredients.dairy_free,
        "ingredients.peanut_free" : meal.ingredients.peanut_free,
        "ingredients.meat_free" : meal.ingredients.meat_free,
    };
    Meal.find(meal_query, function(err, meals){
        if (err || !meals || !meals.length) return callback(err);
        return callback(null, meals);
    });
}

var Meal = mongoose.model("Meal", MealSchema);
module.exports = Meal;