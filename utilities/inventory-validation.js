const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/index");

const inventoryValidation = [

    body("vehicle_make")
        .trim()
        .notEmpty().withMessage("Vehicle make is required")
        .isLength({ max: 50 }).withMessage("Make cannot exceed 50 characters"),

    body("vehicle_model")
        .trim()
        .notEmpty().withMessage("Vehicle model is required")
        .isLength({ max: 50 }).withMessage("Model cannot exceed 50 characters"),

    body("vehicle_description")
        .trim()
        .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters")
        .optional({ checkFalsy: true }),

    body("vehicle_year")
        .trim()
        .matches(/^\d{4}$/).withMessage("Year must be a 4-digit number (e.g., 2023)")
        .notEmpty().withMessage("Year is required"),

    body("vehicle_price")
        .isFloat({ min: 0 }).withMessage("Price must be a positive number")
        .notEmpty().withMessage("Price is required"),

    body("vehicle_miles")
        .isInt({ min: 0 }).withMessage("Mileage cannot be negative")
        .notEmpty().withMessage("Mileage is required"),

    body("vehicle_color")
        .trim()
        .notEmpty().withMessage("Color is required")
        .isLength({ max: 30 }).withMessage("Color cannot exceed 30 characters"),

    body("classification_id")
        .isInt({ min: 1 }).withMessage("Select a valid classification")
        .notEmpty().withMessage("Classification is required"),

    body("vehicle_image")
        .trim()
        .isLength({ max: 200 }).withMessage("Image path is too long")
        .optional({ checkFalsy: true }),

    body("vehicle_thumbnail")
        .trim()
        .isLength({ max: 200 }).withMessage("Thumbnail path is too long")
        .optional({ checkFalsy: true }),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const classificationList = await utilities.buildClassificationList();
            return res.render("inventory/add-inventory", {
                title: "Add New Vehicle",
                classificationList,
                ...req.body,
                message: errors.array()[0].msg
            });
        }
        next();
    }
];

module.exports = inventoryValidation;
