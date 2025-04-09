const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .withMessage("Please enter a valid email address."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Check Registration Data
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check Login Data
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};



validate.updateRules = () => [
  body("account_firstname")
    .trim()
    .notEmpty().withMessage("First name is required"),
  body("account_lastname")
    .trim()
    .notEmpty().withMessage("Last name is required"),
  body("account_email")
    .trim()
    .isEmail().withMessage("Invalid email format")
];

validate.passwordRules = () => [
  body("account_password")
    .trim()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/).withMessage("Must include uppercase, lowercase, and number")
];

validate.checkUpdateData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      errors: errors.array(),
      accountData: req.body
    });
  }
  next();
};

validate.checkPasswordData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      errors: errors.array(),
      accountData: { account_id: req.body.account_id }
    });
  }
  next();
};

validate.checkUpdatedEmail = async (req, res, next) => {
  const { account_id, account_email } = req.body;
  const existingAccount = await accountModel.getAccountById(account_id);

  if (account_email !== existingAccount.account_email) {
    const emailExists = await accountModel.checkExistingEmail(account_email);
    if (emailExists) {
      return res.render("account/update-account", {
        title: "Update Account",
        errors: [{ msg: "Email already in use." }],
        accountData: req.body,
      });
    }
  }

  next();
};

module.exports = validate;