const sharp = require("sharp");
const Recipe = require("../modal/recipeSchema");

// helper: ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// helper: build server URL for storing absolute image URLs
const serverUrl = (req) => `${req.protocol}://${req.get("host")}`;

const createRecipes = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image file is required" });
    if (!req.title)
      return res.status(400).json({ message: "Recipe title is required" });
    const base = `recipe-${Date.now()}`;
    const heroName = `${base}-hero.png`;
    const thumbNail = `${base}-thumbnail.png`;

    await sharp(req.file.buffer)
      .resize(1200, 800, { fit: "cover" })
      .toFormat("jpeg")
      .jpeg({ quality: 85 })
      .toFile(path.join(UPLOAD_DIR, heroName));
    await sharp(req.file.buffer)
      .resize(1200, 800, { fit: "cover" })
      .toFormat("jpeg")
      .jpeg({ quality: 85 })
      .toFile(path.join(UPLOAD_DIR, thumbNail));

    const ingredients = req.body.ingredients
      ? String(req.body.ingredients)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const steps = req.body.steps
      ? String(req.body.steps)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const labels = req.body.labels
      ? String(req.body.labels)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const recipe = new Recipe({
      title: req.body.title,
      slug: req.body.slug || undefined,
      description: req.body.description || "",
      ingredients,
      steps,
      labels,
      chef: req.user._id,
      images: { hero: heroUrl, thumb: thumbUrl },
      publishedAt: req.body.publishedAt
        ? new Date(req.body.publishedAt)
        : new Date(),
    });

    await recipe.save();
    res.status(201).json({ message: "Recipe created", recipe });
  } catch (error) {
    console.error("createRecipe error:", err);
    res.status(500).json({ message: "Failed to create recipe" });
  }
};
const getRecipes = async (req, res) => {
  try {
    const {
      q,
      labels,
      chef,
      sortBy,
      sort = "desc",
      from,
      to,
      page = 1,
      limit = 10,
    } = req.query;
    //pagination
    const safepage = Math.max(1, parseInt(page));
    const safeLimit = Math.min(100, parseInt(limit));
    const skip = (page - 1) * limit;

    //sorting
    const sortByField = sortBy === "created" ? "createdAt" : "publishedAt";
    const sortField = sort === "asc" ? "asc" : "desc";
    const sortObj = { [sortByField]: sortField };

    // query
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (labels)
      filter.labels = {
        $in: String(labels)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };
    if (chef) filter.chef = chef;
    if (from || to) {
      filter.publishedAt = {};
      if (from) filter.publishedAt.$gte = new Date(from);
      if (to) filter.publishedAt.$lte = new Date(to);
    }

    cosnt[(total, docs)] = await Promise.all([
      Recipe.countDocuments(filter),
      Recipe.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(safeLimit)
        .populate("chef", "name email"),
    ]);

    return res.status(200).json({
      count: total,
      data: docs,
    });
  } catch (error) {
    console.log("Something went wrong while getting recipe!", error.message);
    return res.status(500).json({ message: "failed to get recipe" });
  }
};
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      "chef",
      "name email"
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.status(200).json(recipe);
  } catch (err) {
    console.error("getRecipeById error:", err);
    res.status(500).json({ message: "Failed to fetch recipe" });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (String(recipe.chef) !== String(req.user._id)) return res.status(403).json({ message: 'Not owner' });

    // delete image files (if local)
    try {
      const heroFile = recipe.images.hero ? path.basename(recipe.images.hero) : null;
      const thumbFile = recipe.images.thumb ? path.basename(recipe.images.thumb) : null;
      if (heroFile) fs.unlinkSync(path.join(UPLOAD_DIR, heroFile));
      if (thumbFile) fs.unlinkSync(path.join(UPLOAD_DIR, thumbFile));
    } catch (e) {
      // ignore if deletion fails; in production use reliable storage + background cleanup
      console.warn('Failed to delete local image files:', e.message);
    }

    await recipe.remove();
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error('deleteRecipe error:', err);
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (String(recipe.chef) !== String(req.user._id))
      return res.status(403).json({ message: "Not owner" });

    // update text fields
    if (req.body.title) recipe.title = req.body.title;
    if (req.body.description) recipe.description = req.body.description;
    if (req.body.ingredients)
      recipe.ingredients = String(req.body.ingredients)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (req.body.steps)
      recipe.steps = String(req.body.steps)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (req.body.labels)
      recipe.labels = String(req.body.labels)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    recipe.updatedAt = new Date();

    // if new image provided, process and replace
    if (req.file) {
      // delete old files if local (naive: parse URLs)
      try {
        const oldHero = recipe.images.hero
          ? path.basename(recipe.images.hero)
          : null;
        const oldThumb = recipe.images.thumb
          ? path.basename(recipe.images.thumb)
          : null;
        if (oldHero) fs.unlinkSync(path.join(UPLOAD_DIR, oldHero));
        if (oldThumb) fs.unlinkSync(path.join(UPLOAD_DIR, oldThumb));
      } catch (e) {
        // ignore deletion error
      }

      const base = `recipe-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const heroName = `${base}-hero.jpeg`;
      const thumbName = `${base}-thumb.jpeg`;

      await sharp(req.file.buffer)
        .resize(1200, 800, { fit: "cover" })
        .toFormat("jpeg")
        .jpeg({ quality: 85 })
        .toFile(path.join(UPLOAD_DIR, heroName));
      await sharp(req.file.buffer)
        .resize(400, 400, { fit: "cover" })
        .toFormat("jpeg")
        .jpeg({ quality: 80 })
        .toFile(path.join(UPLOAD_DIR, thumbName));

      recipe.images.hero = `${serverUrl(req)}/uploads/${heroName}`;
      recipe.images.thumb = `${serverUrl(req)}/uploads/${thumbName}`;
    }

    await recipe.save();
    res.json({ message: "Recipe updated", recipe });
  } catch (err) {
    console.error("updateRecipe error:", err);
    res.status(500).json({ message: "Failed to update recipe" });
  }
};

 

module.exports = { getRecipes, createRecipes,getRecipeById,updateRecipe ,deleteRecipe};
