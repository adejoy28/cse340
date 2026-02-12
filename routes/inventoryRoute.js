// Needed Resources
const router = require("express").Router();
const invController = require("../controllers/inventoryController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Router to build inventory by classification view

router.get("/", utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

router.post("/add-classification", 
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification));

// Add Inventory routes
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

router.post("/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildDetail));

module.exports = router;