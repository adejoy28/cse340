const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
    console.log("this nav is from home page");
}

module.exports = baseController;