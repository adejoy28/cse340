const {
    body,
    validationResult
} = require("express-validator");
const invValidate = {};
const invModel = require("../models/inventory-model");
const util = require(".");

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
invValidate.classificationRules = () => {
    return [
        body("classification_name")
        .trim()
        .escape()
        .isLength({
            min: 1
        })
        .withMessage("Classification name is required")
        .isAlpha()
        .withMessage("Classification name must contain only letters")
        .custom(async (classification_name) => {
            const classificationExists = await invModel.checkExistingClassification(classification_name);
            if (classificationExists) {
                throw new Error("Classification name already exists");
            }
        })
    ]
}

/* *******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
invValidate.checkClassificationData = async (req, res, next) => {
    const {
        classification_name
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await util.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
            messages: null
        })
        return
    }
    next()
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
invValidate.inventoryRules = () => {
    return [
        // Classification validation
        body("classification_id")
        .trim()
        .notEmpty()
        .withMessage("Please select a classification.")
        .bail()
        .isInt({
            min: 1
        })
        .withMessage("Invalid classification selected."),

        // Make validation
        body("inv_make")
        .trim()
        .escape()
        .isLength({
            min: 3
        })
        .withMessage("Vehicle make is required."),

        // Model validation
        body("inv_model")
        .trim()
        .escape()
        .isLength({
            min: 3
        })
        .withMessage("Vehicle model is required."),

        // Year validation
        body("inv_year")
        .trim()
        .isLength({
            min: 4,
            max: 4
        }).withMessage("Year must be 4 digits.")
        .bail()
        .isNumeric().withMessage("Year must contain only numbers.")
        .bail()
        .custom((value) => {
            const year = parseInt(value)
            const currentYear = new Date().getFullYear()
            return year >= 1900 && year <= currentYear
        })
        .withMessage("Year must be between 1900 and current year."),

        // Description validation
        body("inv_description")
        .trim()
        .escape()
        .isLength({
            min: 5
        })
        .withMessage("Vehicle description is required."),

    // Image path validation
    body("inv_image")
        .trim()
        .optional({
            checkFalsy: true
        }) // Skips validation if empty/null
        .matches(/^\/images\/vehicles\/.*\.(png|jpg|jpeg|gif|webp)$/i)
        .withMessage("Image path must be a valid path (e.g., /images/vehicles/car.png).")
        .isLength({
            max: 255
        })
        .withMessage("Image path is too long."),

        // Thumbnail path validation
        body("inv_thumbnail")
        .trim()
        .optional({
            checkFalsy: true
        }) // Skips validation if empty/null
        .matches(/^\/images\/vehicles\/.*\.(png|jpg|jpeg|gif|webp)$/i)
        .withMessage("Thumbnail path must be a valid path (e.g., /images/vehicles/car-tn.png).")
        .isLength({
            max: 255
        })
        .withMessage("Thumbnail path is too long."),
        // Price validation
        body("inv_price")
        .trim()
        .isFloat({
            min: 0
        })
        .withMessage("Price must be a positive number."),

        // Miles validation
        body("inv_miles")
        .trim()
        .isInt({
            min: 0
        })
        .withMessage("Miles must be a non-negative integer."),

        // Color validation
        body("inv_color")
        .trim()
        .escape()
        .isLength({
            min: 1
        })
        .withMessage("Vehicle color is required."),
    ]
}

/* *******************************
 * Check inventory data and return errors or continue
 * ***************************** */
invValidate.checkInventoryData = async (req, res, next) => {
    const {
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await util.getNav()
        const classificationList = await util.buildClassificationList(classification_id)

        res.render("inventory/add-inventory", {
            errors,
            title: "Add Vehicle",
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            messages: null
        })
        return
    }
    next()
}

/* *******************************
 * Check inventory data and return errors or continue
 * ***************************** */
invValidate.checkUpdateInventoryData = async (req, res, next) => {
    const {
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        inv_id
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await util.getNav()
        const classificationList = await util.buildClassificationList(classification_id)

        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit Vehicle",
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            inv_id,
            messages: null
        })
        return
    }
    next()
}

/* *******************************
 * Check delete inventory data and return errors or continue
 * ***************************** */
invValidate.checkDeleteInventoryData = async (req, res, next) => {
    const {
        inv_id
    } = req.body

    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await util.getNav()

        res.render("inventory/delete-inventory", {
            errors,
            title: "Delete Vehicle",
            nav,
            inv_id,
            messages: null
        })
        return
    }
    next()
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
invValidate.deleteInventoryRules = () => {
    return [
        // Classification validation
        body("inv_id")
        .trim()
        .notEmpty()
        .withMessage("Please select a vehicle.")
        .bail()
        .isInt({
            min: 1
        })
        .withMessage("Invalid vehicle selected."),
    ]
}

module.exports = invValidate