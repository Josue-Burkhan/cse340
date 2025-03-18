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
const Util = require("./utilities") 
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use(cors())
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(Util.addGlobalVariables)

//Index route
app.get("/", (req, res) => {
  res.render("layout", { title: "CSE Motors home", body: "index" })
})
// Inventory routes
app.use("/inv", inventoryRoute)

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
