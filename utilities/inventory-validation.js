const { body, validationResult } = require("express-validator")
const utilities = require("../utilities/index")

// Validations
const inventoryRules = [
    body("inv_make")
        .trim()
        .notEmpty().withMessage("Vehicle make is required")
        .isLength({ max: 50 }).withMessage("Make cannot exceed 50 characters"),

    body("inv_model")
        .trim()
        .notEmpty().withMessage("Vehicle model is required")
        .isLength({ max: 50 }).withMessage("Model cannot exceed 50 characters"),

    body("inv_description")
        .trim()
        .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters")
        .optional({ checkFalsy: true }),

    body("inv_year")
        .trim()
        .matches(/^\d{4}$/).withMessage("Year must be a 4-digit number")
        .notEmpty().withMessage("Year is required"),

    body("inv_price")
        .isFloat({ min: 0 }).withMessage("Price must be a positive number")
        .notEmpty().withMessage("Price is required"),

    body("inv_miles")
        .isInt({ min: 0 }).withMessage("Mileage cannot be negative")
        .notEmpty().withMessage("Mileage is required"),

    body("inv_color")
        .trim()
        .notEmpty().withMessage("Color is required")
        .isLength({ max: 30 }).withMessage("Color cannot exceed 30 characters"),

    body("classification_id")
        .isInt({ min: 1 }).withMessage("Select a valid classification")
        .notEmpty().withMessage("Classification is required"),

    body("inv_image")
        .trim()
        .isLength({ max: 200 }).withMessage("Image path is too long")
        .optional({ checkFalsy: true }),

    body("inv_thumbnail")
        .trim()
        .isLength({ max: 200 }).withMessage("Thumbnail path is too long")
        .optional({ checkFalsy: true })
]

// Middleware: checkInventoryData (To "add")
const checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const classificationList = await utilities.buildClassificationList()
        return res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            classificationList,
            ...req.body,
            message: errors.array()[0].msg
        })
    }
    next()
}

// Middleware: checkUpdateData (To "edit")
const checkUpdateData = async (req, res, next) => {
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        return res.render("./inventory/edit-inventory", {
            errors,
            title: "Edit " + itemName,
            nav,
            classificationList,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
    next()
}

// Export
module.exports = {
    inventoryRules,
    checkInventoryData,
    checkUpdateData
}
