const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

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


/***************************
 * Show Add Inventory Page
 ***************************/
invCont.showAddInventory = async function (req, res, next) {
    try {
        const classificationList = await utilities.buildClassificationList();
        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationList,
            vehicle_make: "",
            vehicle_model: "",
            vehicle_description: "",
            vehicle_image: "/images/vehicles/no-image.png",
            vehicle_thumbnail: "/images/vehicles/no-image.png",
            vehicle_price: "",
            vehicle_year: "",
            vehicle_miles: "",
            vehicle_color: "",
            message: req.flash("message"),
        });
    } catch (error) {
        console.error("Error showing add inventory page:", error);
        next(error);
    }
};


/***************************
 * Add Inventory to Database
 ***************************/
invCont.addInventory = async function (req, res, next) {
    const {
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_description,
        vehicle_image,
        vehicle_thumbnail,
        vehicle_price,
        vehicle_miles,
        vehicle_color,
        classification_id
    } = req.body;

    try {
        if (!vehicle_make || !vehicle_model || !vehicle_color || !classification_id) {
            req.flash("message", "Make, model, color, and classification are required");
            throw new Error("Validation failed");
        }

        if (!/^\d{4}$/.test(vehicle_year)) {
            req.flash("message", "The year must be 4 digits (e.g., 2023)");
            throw new Error("Invalid year");
        }

        const inv_price = parseFloat(vehicle_price);
        const inv_miles = parseInt(vehicle_miles);

        await invModel.addInventory(
            vehicle_make,
            vehicle_model,
            vehicle_year,
            vehicle_description,
            vehicle_image || "/images/vehicles/no-image.png",
            vehicle_thumbnail || "/images/vehicles/no-image.png",
            inv_price,
            inv_miles,
            vehicle_color,
            parseInt(classification_id)
        );

        req.flash("message", "Vehicle added!");
        res.redirect("/inv/add-inventory");

    } catch (error) {
        console.error("Error adding vehicle:", error.message);
        const classificationList = await utilities.buildClassificationList();

        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationList,
            vehicle_make: vehicle_make || "",
            vehicle_model: vehicle_model || "",
            vehicle_description: vehicle_description || "",
            vehicle_image: vehicle_image || "/images/vehicles/no-image.png",
            vehicle_thumbnail: vehicle_thumbnail || "/images/vehicles/no-image.png",
            vehicle_price: vehicle_price || "",
            vehicle_year: vehicle_year || "",
            vehicle_miles: vehicle_miles || "",
            vehicle_color: vehicle_color || "",
            classification_id: classification_id || "",
            message: req.flash("message") || "Error adding vehicle."
        });
    }
};


module.exports = invCont;