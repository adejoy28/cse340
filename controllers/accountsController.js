const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


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
        messages: {
            notice: message
        }
    })
}


/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    const message = req.flash("notice");
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        message
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
    const message = req.flash("notice");

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
            message
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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const {
        account_email,
        account_password
    } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
            message
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: 3600 * 1000
            })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    maxAge: 3600 * 1000
                })
            } else {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3600 * 1000
                })
            }
            return res.redirect("/account/")
        } else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
                message
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

async function buildManagement(req, res) {
    let nav = await utilities.getNav()
    res.render("./account/management", {
        title: "Account Management",
        nav,
        errors: null,
        messages: req.flash(),
        accountData: res.locals.accountData,
    });
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been successfully logged out.")
    res.redirect("/account/login")
}
/* ****************************************
 *  Deliver update account view
 * *************************************** */
async function buildUpdateAccount(req, res) {
    let nav = await utilities.getNav()
    const accountId = res.locals.accountData.account_id
    const accountData = await accountModel.getAccountById(accountId)

    res.render("./account/update-account", {
        title: "Account Information",
        nav,
        errors: null,
        messages: {
            notice: req.flash("notice")
        },
        accountData
    });
}

/* ****************************************
 *  Process account update
 * *************************************** */
async function updateAccount(req, res) {
    console.log("updateAccount function is running")
    const {
        account_id,
        account_firstname,
        account_lastname,
        account_email
    } = req.body

    const updateResult = await accountModel.updateAccount(
        account_id,
        account_firstname,
        account_lastname,
        account_email
    )

    if (updateResult.rowCount > 0) {
           // Get updated account data from database
           const updatedAccountData = await accountModel.getAccountById(account_id)
           delete updatedAccountData.account_password

           // Create new JWT token with updated data
           const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, {
               expiresIn: 3600 * 1000
           })

           // Update the cookie with new token
           if (process.env.NODE_ENV === 'development') {
               res.cookie("jwt", accessToken, {
                   httpOnly: true,
                   maxAge: 3600 * 1000
               })
           } else {
               res.cookie("jwt", accessToken, {
                   httpOnly: true,
                   secure: true,
                   maxAge: 3600 * 1000
               })
           }
        req.flash("notice", "Account information updated successfully.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the update failed.")
        res.redirect("/account/update/" + account_id)
    }
}

/* ****************************************
 *  Process password change
 * *************************************** */
async function changePassword(req, res) {
    const {
        account_id,
        new_password
    } = req.body
    console.log("changePassword function is running")
    try {
        // Get current account data to verify current password
        const accountData = await accountModel.getAccountById(account_id)
        const currentAccount = await accountModel.getAccountByEmail(accountData.account_email)

        // if (await bcrypt.compare(current_password, currentAccount.account_password)) {
            // Hash new password
           const hashedPassword = bcrypt.hashSync(new_password, 10)

            // Update password
            const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

            if (updateResult.rowCount > 0) {
                req.flash("notice", "Password updated successfully.")
                res.redirect("/account/")
            } else {
                req.flash("notice", "Sorry, the password update failed.")
                res.redirect("/account/update/" + account_id)
            }
        // } else {
        //     req.flash("notice", "Current password is incorrect.")
        //     res.redirect("/account/update/" + account_id)
        // }
    } catch (error) {
        req.flash("notice", "An error occurred while updating password.")
        res.redirect("/account/update/" + account_id)
    }
}


module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    accountLogout,
    buildManagement,
    buildUpdateAccount,
    updateAccount,
    changePassword
    // loginAccount
}