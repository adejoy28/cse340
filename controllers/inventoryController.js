// Needed Resources
const invModel = require("../models/inventory-model");
const util = require("../utilities");

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

    const grid = await util.buildClassificationGrid(data);
    let nav = await util.getNav();
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

    const grid = await util.buildDetailPage(data);
    if (grid) {
        console.log("successfully generated from utility");
    }

    let nav = await util.getNav();
    res.render("./inventory/details", {
        title: data.inv_make + " " + data.inv_model,
        nav,
        grid
    });
}

/* ****************************************
 *  Deliver inventory management view
 * *************************************** */
invCont.buildManagement = async function (req, res, next) {
    let nav = await util.getNav();
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        messages: req.flash()
    });
}

/* ****************************************
 *  Deliver add classification view
 * *************************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await util.getNav();
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        messages: req.flash()
    });
}

/* ****************************************
 *  Process add classification
 * *************************************** */
invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body;

    const addClassificationResult = await invModel.addClassification(classification_name);
    
    if (addClassificationResult) {
        req.flash("notice", "Classification added successfully");
        res.redirect("/inv/");
    } else {
        req.flash("notice", "Failed to add classification");
        res.redirect("/inv/add-classification");
    }

}

/* ****************************************
 *  Deliver add inventory view
 * *************************************** */
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await util.getNav();
    const classificationList = await util.buildClassificationList();

    res.render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: null,
        messages: null
    });
}

/* ****************************************
 *  Process Add Inventory
 * *************************************** */
invCont.addInventory = async function (req, res) {
    const invData = req.body;

    try {

        if (invData.inv_image === "" || invData.inv_thumbnail === "") {
            invData.inv_image = "/images/vehicles/no-image.png";
            invData.inv_thumbnail = "/images/vehicles/no-image.png";
        }   

        const result = await invModel.addInventory(invData);

        if (result.rowCount) {
            // Success - redirect to management with success message
            req.flash("notice", `Vehicle "${invData.inv_make} ${invData.inv_model}" was successfully added.`);
            res.redirect("/inv/");
        } else {
            // Failure - redirect back with failure message
            req.flash("notice", "Sorry, adding the vehicle failed.");
            res.redirect("/inv/add-inventory");
        }
    } catch (error) {
        console.error("Error in addInventory controller:", error);
        req.flash("notice", "Sorry, adding the vehicle failed.");
        res.redirect("/inv/add-inventory");
    }
}


module.exports = invCont;