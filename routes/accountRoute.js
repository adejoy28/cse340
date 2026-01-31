// Needed Resources
const router = require("express").Router();
const accountsController = require("../controllers/accountsController");
const utilities = require("../utilities");

// Router to build inventory by classification view
router.get("/login", utilities.handleErrors(accountsController.buildLogin));

// Route to deliver Registration View
router.get("/register", utilities.handleErrors(accountsController.buildRegister))

//Route to deliver Register Account
router.post('/register', utilities.handleErrors(accountsController.registerAccount))


module.exports = router;