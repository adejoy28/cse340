// Needed Resources
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/**
 * Build inventoyry by classificaion view
 */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    console.log(data);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid
    })
}

module.exports = invCont;