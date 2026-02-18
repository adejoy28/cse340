// Needed Resources
const router = require("express").Router();
const invController = require("../controllers/inventoryController");
const util = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Router to build inventory by classification view

router.get("/",
    util.checkLogin,
    util.checkAccountType,
    util.handleErrors(invController.buildManagement));

router.get("/add-classification",
    util.checkLogin,
    util.checkAccountType,
    util.handleErrors(invController.buildAddClassification));

router.post("/add-classification",
    util.checkLogin,
    util.checkAccountType,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    util.handleErrors(invController.addClassification));

// Add Inventory routes
router.get("/add-inventory",
    util.checkLogin,
    util.checkAccountType,
    util.handleErrors(invController.buildAddInventory));

router.post("/add-inventory",
    util.checkLogin,
    util.checkAccountType,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    util.handleErrors(invController.addInventory)
);

router.get("/type/:classificationId", util.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inventoryId", util.handleErrors(invController.buildDetail));

router.get("/getInventory/:classification_id", util.handleErrors(invController.getInventoryJSON))

// Edit inventory routes
router.get("/edit/:inventoryId", util.handleErrors(invController.buildEditInventory));

router.post("/update/",
    util.checkLogin,
    util.checkAccountType,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    util.handleErrors(invController.updateInventory)
);

router.get("/delete/:inventoryId", util.handleErrors(invController.buildDeleteInventory));
router.post("/delete/",
    util.checkLogin,
    util.checkAccountType,
    invValidate.deleteInventoryRules(),
    invValidate.checkDeleteInventoryData,
    util.handleErrors(invController.deleteInventory));

// Search vehicles
router.get("/search", util.handleErrors(invController.buildSearchVehicles));
router.post("/search",
    invValidate.searchRules(),
    invValidate.checkSearchData,
    util.handleErrors(invController.buildSearchVehicles));

module.exports = router;