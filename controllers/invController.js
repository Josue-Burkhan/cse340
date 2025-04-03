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

        res.render("inventory/classification", {
            title: className + " vehicles",
            nav,
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

        res.render("inventory/detail", {
            title: data[0].inv_make + " " + data[0].inv_model,
            nav,
            breadcrumbs,
            car: data[0]
        })

    } catch (error) {
        next(error)
    }
}

/* ***************************
 * Add classification to inventory
 * ************************** */
invCont.addClassification = async function (req, res, next) {
    const errors = validationResult(req);
    const { classification_name } = req.body;

    if (!errors.isEmpty()) {
        req.flash("message", errors.array()[0].msg);
        return res.render("inventory/add-classification", {
            message: req.flash("message"),
            title: "Add New Classification",
            classification_name,
        });
    }

    try {
        await invModel.addClassification(classification_name);
        req.flash("message", "Classification added successfully!");

        let nav = await utilities.getNav();

        res.render("inventory/management", {
            title: "Inventory Management",
            message: req.flash("message"),
            nav
        });

    } catch (error) {
        req.flash("message", "Failed to add classification.");
        res.render("inventory/add-classification", {
            message: req.flash("message"),
            title: "Add New Classification",
            classification_name
        });
    }
};

invCont.deleteClassification = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classificationId);
        if (isNaN(classification_id)) {
            req.flash("message", "Invalid classification ID.");
            return res.redirect("/inv");
        }

        const result = await invModel.deleteClassification(classification_id);
        if (result === 0) {
            req.flash("message", "Classification not found.");
        } else {
            req.flash("message", "Classification deleted successfully!");
        }

        res.redirect("/");
    } catch (error) {
        next(error);
    }
};

invCont.getClassifications = async function () {
    try {
        return await invModel.getAllClassifications();
    } catch (error) {
        throw new Error("Error fetching classifications: " + error.message);
    }
};

/* ***************************
 * Show Add Classification View
 * ************************** */
invCont.showAddClassification = async function (req, res, next) {
    try {
        const classifications = await invModel.getAllClassifications();
        let nav = await utilities.getNav();

        res.render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            classifications,
            classification_name: '',
            message: req.flash("message"),
        });
    } catch (error) {
        console.error("Error loading add-classification page:", error);
        req.flash("message", "Error loading the page.");
        res.redirect("/inv");
    }
};

/* ***************************
 * Add Inventory
 * ************************** */
invCont.showAddInventory = async function (req, res, next) {
    try {
        const classificationList = await utilities.buildClassificationList();

        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationList,
            message: req.flash('message'),
            vehicle_make: '',
            vehicle_model: '',
            vehicle_year: '',
            vehicle_price: '',
        });
    } catch (error) {
        console.error("Error loading add-inventory page:", error);
        req.flash("message", "Error loading the page.");
        res.redirect("/inv");
    }
};



invCont.addInventory = async function (req, res, next) {
    const { vehicle_make, vehicle_model, vehicle_year, vehicle_price, classification_id } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("message", "Please fill in all required fields.");
        return res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationList: await utilities.buildClassificationList(classification_id),
            message: req.flash("message"),
            vehicle_make,
            vehicle_model,
            vehicle_year,
            vehicle_price,
        });
    }

    try {
        await invModel.addInventory(vehicle_make, vehicle_model, vehicle_year, vehicle_price, classification_id);
        req.flash("message", "Vehicle added successfully!");
        res.redirect("/inv");
    } catch (error) {
        console.error("Error adding vehicle:", error);
        req.flash("message", "Failed to add vehicle.");
        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationList: await utilities.buildClassificationList(classification_id),
            message: req.flash("message"),
            vehicle_make,
            vehicle_model,
            vehicle_year,
            vehicle_price,
        });
    }
};



module.exports = invCont;