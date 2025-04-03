const { body, validationResult } = require("express-validator");

const classificationValidation = [
  body("classification_name")
    .trim()
    .notEmpty()
    .matches(/^[A-Za-z]+$/)
    .withMessage("Classification name must contain only letters."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("message", errors.array()[0].msg);
      return res.render("inventory/add-classification", {
        message: req.flash("message"),
        title: "Add New Classification",
        classification_name: req.body.classification_name,
      });
    }
    next();
  },
];

module.exports = classificationValidation;
