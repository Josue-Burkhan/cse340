const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("layout", { title: "Home", nav, view: "index" })
}

module.exports = baseController