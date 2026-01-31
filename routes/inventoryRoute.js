// Needed Resources
const router = require("express").Router();
const invController = require("../controllers/inventoryController");
const utilities = require("../utilities");

// Router to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetail));

module.exports = router;