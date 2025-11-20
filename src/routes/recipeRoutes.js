// routes/recipeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const ensureChef = require("../middleware/ensureChef");
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

// multer memory storage (we process buffer with sharp)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.get("/", getRecipes); // public
router.get("/:id", getRecipeById); // public
router.post("/", auth, ensureChef, upload.single("image"), createRecipe); // protected (chef)
router.put("/:id", auth, ensureChef, upload.single("image"), updateRecipe); // owner only enforced in controller
router.delete("/:id", auth, ensureChef, deleteRecipe); // owner only enforced in controller

module.exports = router;
