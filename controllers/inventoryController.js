// Needed Resources
const { render } = require("ejs");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/**
 * Build inventoyry by classificaion view
 */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    
    // Input validation
    if (!classification_id || isNaN(classification_id)) {
        const err = new Error("Invalid classification ID");
        err.status = 400;
        throw err;
    }

    const data = await invModel.getInventoryByClassificationId(classification_id);

    // Check if data is empty or invalid
    if (!data || !data.length) {
        const err = new Error("No vehicles found for this classification.");
        err.status = 404;
        throw err;
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid
    });
}

invCont.buildDetail = async function (req, res, next) {
    const inventory_id = req.params.inventoryId;
    console.log("Inventory ID: " + inventory_id);

    const data = await invModel.getSingleInventory(inventory_id);

    if (!data) {
        const err = new Error("Failed to fetch inventory data");
        err.status = 500;
        throw err;
    }

    const grid = await utilities.buildDetailPage(data);
    if (grid) {
        console.log("successfully generated from utility");
    }

    let nav = await utilities.getNav();
    res.render("./inventory/details", {
        title: data.inv_make + " " + data.inv_model,
        nav,
        grid
    });
}

module.exports = invCont;