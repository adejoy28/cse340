/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const util = require("./utilities")
const errorRoutes = require('./routes/error');
const errorHandler = require('./middleware/errorMiddleware');


/* ***********************
 * View Engine and Template
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index Route
app.get("/", util.handleErrors(baseController.buildHome));

// Inventory Routes
app.use("/inv", util.handleErrors(inventoryRoute))

// Error routes
app.use("/error", errorRoutes);

// 404 handler - must come before the error handlers
app.use(async (req, res, next) => {
  const imgPath = "/images/site/404.jpg"
  next({
    status: 404,
    message: "We appear to have lost the Page",
    imgPath
  })
})

/**
 * Express Error handler
 * Place after all other middleware
 */
app.use(async (err, req, res, next) => {
  let nav = await util.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  // Handle 404 errors with the custom error page
  if (err.status == 404) {
    return res.status(404).render("errors/error", {
      title: err.status || 'Server Error',
      message: err.message,
      imgPath: err.imgPath,
      nav
    });
  }
  
  // For all other errors (500, etc.), use the error middleware
  errorHandler(err, req, res, next);
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
// const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://localhost:${port}`)
})
