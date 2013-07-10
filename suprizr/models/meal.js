var BaseSchema = require("../schemas/base"),
      mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        extend = require("mongoose-schema-extend");

var MealSchema = BaseSchema.extend({
    name: String,
    description: String,
    health: { type: Number, index: true }, // number between 0 - 1 indicating health. 0 = healthy
    restaurant: { type: String, ref: "Restaurant", index: true },
    num_orders: { type: Number, default: 0 }, // number of times this meal was ordered
    price: Number, // Restaurants meal price
    ingredients: {
        gluten_free: { type: Boolean, index: true },
        dairy_free: { type: Boolean, index: true },
        peanut_free: { type: Boolean, index: true },
        meat_free: { type: Boolean, index: true }
    }
});

MealSchema.statics.create = function(data, callback) {
    (new Meal(data)).save(callback);
}

MealSchema.statics.mealsForRestaurant = function(rest_id, callback) {
    var query = {
        "restaurant" : rest_id
    };
    this.find(query, callback);
}

/**
 * Finds a Supriz meal for the given data and restaurants
 */
MealSchema.statics.supriz = function(restaurant_ids, meal, callback) {
    var min_health = Math.max(meal.health - 0.2, 0);
    if (!meal.ingredients) meal.ingredients = {};
    var meal_query = {
        "restaurant" : { "$in" : restaurant_ids },
        "health" : { "$gte" : min_health, "$lte" : meal.health },
    };

    var ingredients = ["gluten_free", "dairy_free", "peanut_free", "meat_free"];
    SP.each(ingredients, function(i,ing){
        if (meal.ingredients[ing]) {
            if (!meal_query.ingredients) meal_query.ingredients = {};
            meal_query.ingredients[ing] = true;
        }
    });
    Meal.find(meal_query, function(err, meals){
        if (err || !meals || !meals.length) return callback(err);
        return callback(null, meals);
    });
}

var Meal = mongoose.model("Meal", MealSchema);
module.exports = Meal;