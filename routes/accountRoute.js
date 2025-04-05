const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// Protected route: /account/
router.get("/",
    (req, res, next) => {
        if (!res.locals.loggedin) {
            req.flash("notice", "You must log in first.");
            return res.redirect("/account/login");
        }
        next();
    },
    utilities.handleErrors(accountController.buildAccountManagement)
);


router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post("/register", regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

module.exports = router;