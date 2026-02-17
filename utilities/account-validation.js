const utilities = require(".")
const {
    body,
    validationResult
} = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .isLength({
            min: 1
        })
        .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
        .trim()
        .escape()
        .isLength({
            min: 1
        })
        .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .escape()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("Please provide a valid email.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) {
                throw new Error("Email exists. Please log in or use different email")
            }
        }),

        // password is required and must be strong password
        body("account_password")
        .trim()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const {
        account_firstname,
        account_lastname,
        account_email
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            message: null
        })
        return
    }
    next()
}

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    console.log("checking the loginRules")
    return [
        // valid email is required and must already exist in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Email is required.")
        .bail() // Stop validation if empty
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email.")
        .bail() // Stop validation if invalid format
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (!emailExists) {
                throw new Error("Email does not exist. Please register or use different email")
            }
        }),

        // password is required and must be strong password
        body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required."),
    ]
}


/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const {
        account_email,
        account_password
    } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
            account_password
        })
        return
    }
    next()
}

validate.updateRules = () => {
    console.log("checking the updateRules")
    return [
    body("account_firstname")
        .trim()
        .escape()
        .isLength({
            min: 1
        })
        .withMessage("Please provide a first name."),

        body("account_lastname")
        .trim()
        .escape()
        .isLength({
            min: 1
        })
        .withMessage("Please provide a last name."),

        body("account_email")
        .trim()
        .escape()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email.")
        .custom(async (account_email, {
            req
        }) => {
            const account_id = req.body.account_id
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) {
                const currentAccount = await accountModel.getAccountById(account_id)
                if (currentAccount.account_email !== account_email) {
                    throw new Error("Email exists. Please use a different email")
                }
            }
        })
    ]
}

validate.checkUpdateData = async (req, res, next) => {
    console.log("checking the checkUpdateData")
    const {
        account_firstname,
        account_lastname,
        account_email
    } = req.body
    let errors = []

    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update-account", {
            title: "Update Account Information",
            nav,
            errors,
            accountData: {
                account_id: req.body.account_id,
                account_firstname,
                account_lastname,
                account_email
            }
        })
        return
    }
    next()
}
validate.passwordRules = () => {
    return [
        body("new_password")
        .trim()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password must be at least 12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
        body("confirm_password")
        .trim()
        .custom((value, {
            req
        }) => {
            if (value !== req.body.new_password) {
                throw new Error('Password confirmation does not match');
            }
            return true;
        })
        .withMessage("Passwords do not match."),
    ]
}
validate.checkPasswordData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const accountData = await accountModel.getAccountById(req.body.account_id)
        res.render("account/update-account", {
            title: "Update Account Information",
            nav,
            errors,
            accountData
        })
        return
    }
    next()
}
module.exports = validate;