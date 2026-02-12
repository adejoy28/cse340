const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    const message = req.flash("notice");
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
 *  process login view
 * *************************************** */
async function loginAccount(req, res) {
    const {
        account_email,
        account_password
    } = req.body

    const loginResult = await accountModel.loginAccount(
        account_email,
        account_password
    )   

    if (loginResult) {
        req.flash("notice", `Congratulations, you're logged in ${account_email}. Please log in.`);
        res.redirect("/"); // Redirect instead of render
    } else {
        req.flash("notice", "Sorry, the login failed.");
        res.redirect("/account/login"); // Redirect instead of render
    }
}


/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_password
    } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
        res.redirect("/account/login"); // Redirect instead of render
    } else {
        req.flash("notice", "Sorry, the registration failed.");
        res.redirect("/account/register"); // Redirect instead of render
    }

}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    loginAccount
}