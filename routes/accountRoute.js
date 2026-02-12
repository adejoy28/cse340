// Needed Resources
const router = require("express").Router();
const accountsController = require("../controllers/accountsController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation')

// Router to build inventory by classification view
router.get("/login", utilities.handleErrors(accountsController.buildLogin));

// Process the login attempt temporarily
router.post(
    "/login", 
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountsController.loginAccount)
)

// Route to deliver Registration View
router.get("/register", utilities.handleErrors(accountsController.buildRegister))

//Route to deliver Register Account
router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountsController.registerAccount)
)


module.exports = router;