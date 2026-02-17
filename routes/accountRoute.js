// Needed Resources
const router = require("express").Router();
const accountsController = require("../controllers/accountsController");
const util = require("../utilities");
const regValidate = require('../utilities/account-validation')


router.get("/", 
    util.checkLogin,
    util.handleErrors(accountsController.buildManagement));

// Router to build inventory by classification view
router.get("/login", util.handleErrors(accountsController.buildLogin));

// Process the login 
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    util.handleErrors(accountsController.accountLogin)
)

// Route to handle logout
router.get("/logout", util.handleErrors(accountsController.accountLogout))

// Route to deliver Registration View
router.get("/register", util.handleErrors(accountsController.buildRegister))

//Route to deliver Register Account
router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    util.handleErrors(accountsController.registerAccount)
)

// Route to deliver update account view
router.get("/update/:id",
    util.checkLogin,
    util.handleErrors(accountsController.buildUpdateAccount));

// Route to process update account
router.post("/update/",
    util.checkLogin,
    regValidate.updateRules(),
    regValidate.checkUpdateData,
    util.handleErrors(accountsController.updateAccount)
)

router.post("/change-password/",
    util.checkLogin,
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    util.handleErrors(accountsController.changePassword));

module.exports = router;