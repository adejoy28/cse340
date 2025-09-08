// Needed Resources
const router = require("express").Router();
const invController = require("../controllers/inventoryController");

// Router to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;