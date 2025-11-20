const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },

  slug: { type: String, index: true }, // SEO-friendly URL

  description: String,

  ingredients: [String],

  steps: [String],

  labels: [String], // tags: spicy, vegan, healthy...

  imageUrl: {
    hero: { type: String, required: true }, // large image
    thumb: { type: String, required: true }, // small thumbnail
  },

  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  publishedAt: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: Date,
});

// 🔍 Full-text search index (title + description + labels)
recipeSchema.index({
  title: "text",
  description: "text",
  labels: "text",
});

// 📌 Auto-update updatedAt before save
recipeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Recipe =mongoose.model("Recipe", recipeSchema);
module.exports = Recipe;
