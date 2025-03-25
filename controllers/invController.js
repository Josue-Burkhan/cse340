const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classificationId)
        if (isNaN(classification_id)) return utilities.handleNotFound(res, next, "Invalid classification ID")

        const data = await invModel.getInventoryByClassificationId(classification_id)
        if (!data || data.length === 0) return utilities.handleNotFound(res, next, "No vehicles found")

        const grid = await utilities.buildClassificationGrid(data)
        let nav = await utilities.getNav()
        const className = data[0].classification_name

        res.render("layout", {
            title: className + " vehicles",
            nav,
            view: "inventory/classification",
            grid
        })

    } catch (error) {
        next(error)
    }
}

/* ***************************
 *  Build inventory details by inventory ID view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.invId)
        if (isNaN(inv_id)) return utilities.handleNotFound(res, next, "Invalid vehicle ID")

        const data = await invModel.getInventoryById(inv_id)
        if (!data || data.length === 0) return utilities.handleNotFound(res, next, "Car not found")

        let nav = await utilities.getNav()
        let breadcrumbs = utilities.getBreadcrumbs(req, data[0].classification_id)

        data[0].inv_price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data[0].inv_price)

        res.render("layout", {
            title: data[0].inv_make + " " + data[0].inv_model,
            nav,
            breadcrumbs,
            view: "inventory/detail",
            car: data[0]
        })

    } catch (error) {
        next(error)
    }
}

module.exports = invCont
