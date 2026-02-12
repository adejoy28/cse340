/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const util = require("./utilities")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const errorRoutes = require("./routes/error")
const baseController = require("./controllers/baseController")
const session = require("express-session")
const pool = require("./database/")

/* *************************
 * Middleware
 * ************************/
app.use(session({
  store: new(require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})


app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))
/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index Route
app.get("/", util.handleErrors( baseController.buildHome));

// Inventory Routes
app.use("/inv", util.handleErrors(inventoryRoute))

// Account Routes
app.use("/account", util.handleErrors(accountRoute))

// Error routes
app.use("/error", errorRoutes);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: 'Sorry, we appear to have lost that page.'
  })
})


/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  const imgPath = "/images/site/404.jpg"
  let nav = await util.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) {
    message = err.message
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav,
    imgPath
  })
})


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
