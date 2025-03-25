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
const cors = require("cors");
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use(cors())
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(utilities.addGlobalVariables)

//Index route
app.get("/", (req, res) => {
  res.render("layout", { title: "CSE Motors home", view: "index" })
})
// Inventory routes
app.use("/inv", inventoryRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let status = err.status || 500;
  let message = status == 404
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?";

  let details = process.env.NODE_ENV === "development" ? err.stack : "";

  res.status(status).render("layout", {
    title: `${status} Server Error`,
    nav,
    view: "errors/error",
    message,
    details
  });
});



// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

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
  console.log(`app listening on: http://${host}:${port}`)
})


