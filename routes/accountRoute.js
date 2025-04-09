const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// Public routes
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post("/register", regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Protected route: /account/
router.get("/",
    (req, res, next) => {
        if (!res.locals.user.loggedIn) {
            req.flash("notice", "You must log in first.");
            return res.redirect("/account/login");
        }
        next();
    },
    utilities.handleErrors(accountController.buildAccountManagement)
);

//Update Account
// Rutas GET
router.get("/update/:id", utilities.handleErrors(accountController.buildUpdateAccount));

// Rutas POST
router.post("/update",
    regValidate.updateRules(),
    regValidate.checkUpdateData,
    regValidate.checkUpdatedEmail,
    utilities.handleErrors(accountController.updateAccount)
);

router.post("/update-password",
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePassword)
);

router.get("/logout", accountController.accountLogout);

module.exports = router;
