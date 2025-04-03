const { body, validationResult } = require("express-validator");

const inventoryValidation = [
    body("vehicle_make")
        .trim()
        .notEmpty()
        .withMessage("Vehicle make is required.")
        .isLength({ max: 50 })
        .withMessage("Vehicle make cannot be longer than 50 characters."),

    body("vehicle_model")
        .trim()
        .notEmpty()
        .withMessage("Vehicle model is required.")
        .isLength({ max: 50 })
        .withMessage("Vehicle model cannot be longer than 50 characters."),

    body("vehicle_year")
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("Vehicle year must be between 1900 and the current year.")
        .notEmpty()
        .withMessage("Vehicle year is required."),

    body("vehicle_price")
        .isFloat({ min: 0 })
        .withMessage("Vehicle price must be a positive number.")
        .notEmpty()
        .withMessage("Vehicle price is required."),

    body("classification_id")
        .isInt({ min: 1 })
        .withMessage("Please select a valid classification.")
        .notEmpty()
        .withMessage("Classification is required."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("message", errors.array()[0].msg);
            return res.render("inventory/add-inventory", {
                message: req.flash("message"),
                title: "Add New Vehicle",
                vehicle_make: req.body.vehicle_make,
                vehicle_model: req.body.vehicle_model,
                vehicle_year: req.body.vehicle_year,
                vehicle_price: req.body.vehicle_price,
                classification_id: req.body.classification_id,
            });
        }
        next();
    },
];

module.exports = inventoryValidation;
