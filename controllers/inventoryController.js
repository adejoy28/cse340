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
    const classificationSelect = await util.buildClassificationList()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        messages: req.flash(),
        classificationSelect
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
    const {
        classification_name
    } = req.body;

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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ****************************************
 *  Deliver edit inventory view
 * *************************************** */
invCont.buildEditInventory = async function (req, res, next) {
    let nav = await util.getNav();

    const inventory_id = parseInt(req.params.inventoryId);
    const itemData = await invModel.getSingleInventory(inventory_id)
    console.log(itemData)

    const classificationList = await util.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    console.log(inventory_id);

    res.render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList,
        errors: null,
        messages: null,
        inventory_id: itemData.inv_id,
        inventory_make: itemData.inv_make,
        inventory_model: itemData.inv_model,
        inventory_year: itemData.inv_year,
        inventory_description: itemData.inv_description,
        inventory_image: itemData.inv_image,
        inventory_thumbnail: itemData.inv_thumbnail,
        inventory_price: itemData.inv_price,
        inventory_miles: itemData.inv_miles,
        inventory_color: itemData.inv_color,
        classification_id: itemData.classification_id
    });
}


/* ****************************************
 *  Process Update Inventory
 * *************************************** */
invCont.updateInventory = async (req, res) => {
    let nav = await util.getNav();

    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;

    try {

        // Image Fallback
        let imgPath = inv_image || "/images/vehicles/no-image.png";
        let thumbPath = inv_thumbnail || "/images/vehicles/no-image.png";
        // console.log(inv_make + " " + inv_model);

        const updateResult = await invModel.updateInventory(
            parseInt(inv_id), // Convert to integer
            inv_make, // String - OK
            inv_model, // String - OK
            inv_description, // String - OK
            imgPath, // String - OK
            thumbPath, // String - OK
            parseFloat(inv_price), // Convert to float
            parseInt(inv_year), // Convert to integer
            parseInt(inv_miles), // Convert to integer
            inv_color, // String - OK
            parseInt(classification_id)// Convert to integer
        );

        if (updateResult) {
            // Success - redirect to management with success message
            itemName = updateResult.inv_make + " " + updateResult.inv_model;
            req.flash("notice", `Vehicle "${itemName}" was successfully updated.`);
            res.redirect("/inv/");
        } else {
            const classificationSelect = await util.buildClassificationList(classification_id)
            const itemName = `${inv_make} ${inv_model}`
            req.flash("notice", "Sorry, the insert failed.")
            res.status(501).render("/inv/edit-inventory", {
                title: "Edit " + itemName,
                nav,
                classificationSelect: classificationSelect,
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_year,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                classification_id
            })
        }
    } catch (error) {
        console.error("Error in updateInventory controller:", error);
        req.flash("notice", "Sorry, updating the vehicle failed.");
        res.redirect("/inv/edit/" + inv_id);
    }
}



/* ****************************************
 *  Deliver delete inventory view
 * *************************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
    let nav = await util.getNav();

    const inventory_id = parseInt(req.params.inventoryId);
    const itemData = await invModel.getSingleInventory(inventory_id)
    console.log(itemData)

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    console.log(inventory_id);

    res.render("inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        messages: null,
        inventory_id: itemData.inv_id,
        inventory_make: itemData.inv_make,
        inventory_model: itemData.inv_model,
        inventory_year: itemData.inv_year,
        inventory_price: itemData.inv_price,
    });
}

/* ****************************************
 *  Process Delete Inventory
 * *************************************** */
invCont.deleteInventory = async (req, res) => {
    let nav = await util.getNav();

    const {
        inv_id,
        inv_make,
        inv_model,
        inv_price,
        inv_year,
    } = req.body;

    try {

        const deleteResult = await invModel.deleteInventory(
            parseInt(inv_id), // Convert to integer
            inv_make, // String - OK
            inv_model, // String - OK
            parseFloat(inv_price), // Convert to float
            parseInt(inv_year) // Convert to integer
        );
        
        if (deleteResult) {
            // Success - redirect to management with success message
            itemName = deleteResult.inv_make + " " + deleteResult.inv_model;
            req.flash("notice", `Vehicle "${itemName}" was successfully deleted.`);
            res.redirect("/inv/");
        } else {
            const itemName = `${inv_make} ${inv_model}`
            req.flash("notice", "Sorry, the delete failed.")
            res.status(501).render("/inv/delete-inventory", {
                title: "Delete " + itemName,
                nav,
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_year,
                inv_price,
            })
        }
    } catch (error) {
        console.error("Error in deleteInventory controller:", error);
        req.flash("notice", "Sorry, deleting the vehicle failed.");
        res.redirect("/inv/delete/" + inv_id);
    }
}

/* ****************************************
 *  Process vehicle search
 * *************************************** */
invCont.buildSearchVehicles = async function (req, res) {
    try {
        const filters = {
            minPrice: req.body.minPrice || null,
            maxPrice: req.body.maxPrice || null,
            year: req.body.year || null,
            maxMileage: req.body.maxMileage || null,
            classification_id: req.body.classification_id || null
        };

        let nav = await util.getNav();
        const searchResults = await invModel.searchVehicles(filters);
        const classifications = await invModel.getClassifications();

        res.render("inventory/search-results", {
            title: "Search Results",
            nav,
            classifications: classifications.rows,
            vehicles: searchResults,
            filters,
            errors: null
        });
    } catch (error) {
        console.error("Search error:", error);
        req.flash("notice", "Search failed. Please try again.");
        res.redirect("/inv/search");
    }
}

module.exports = invCont;