const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
require("dotenv").config()
const { body, validationResult } = require("express-validator");


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
    })
}
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
        })
    }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            const payload = {
                account_id: accountData.account_id,
                account_type: accountData.account_type
            };

            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            );

            res.cookie("jwt", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 3600000
            });

            return res.redirect("/account/");
        }
        else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        console.error("Error en accountLogin:", error.message);
        req.flash("notice", "Error in the servidor. Try Again.");
        res.redirect("/account/login");
    }
}

async function buildAccountManagement(req, res) {
    try {
        let nav = await utilities.getNav();
        res.render("account/account-management", {
            title: "Account Management",
            nav,
            errors: null,
        });
    } catch (error) {
        console.error("Error en buildAccountManagement:", error);
        res.status(500).send("Error in the servidor");
    }
}

async function accountLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error while destroying session:", err);
            return res.status(500).send("Failed to log out");
        }
        res.clearCookie("jwt");
        res.redirect("/");
    });
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildUpdateAccount(req, res) {
    try {
        const account_id = req.params.id;
        const accountData = await accountModel.getAccountById(account_id);
        let nav = await utilities.getNav();

        res.render("account/update-account", {
            title: "Update Account",
            nav,
            errors: null,
            accountData
        });
    } catch (error) {
        console.error("Error en buildUpdateAccount:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function updateAccount(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.locals.account_firstname = req.body.account_firstname;
        res.locals.account_lastname = req.body.account_lastname;
        res.locals.account_email = req.body.account_email;

        return res.render("account/update-account", {
            title: "Update Account",
            errors: errors.array(),
            accountData: { account_id: req.body.account_id }
        });
    }
    try {
        const { account_id, account_firstname, account_lastname, account_email } = req.body;
        const updateResult = await accountModel.updateAccount(
            account_id,
            account_firstname,
            account_lastname,
            account_email
        );

        if (updateResult) {
            req.flash("success", "Account updated successfully!");
            res.redirect("/account/");
        } else {
            req.flash("error", "Failed to update account.");
            res.redirect(`/account/update/${account_id}`);
        }
    } catch (error) {
        console.error("Error en updateAccount:", error);
        req.flash("error", "Internal server error.");
        res.redirect(`/account/update/${account_id}`);
    }
}

async function updatePassword(req, res) {
    const errors = validationResult(req);
    const account_id = req.body.account_id;

    if (!errors.isEmpty()) {
        return res.render("account/update-account", {
            title: "Update Account",
            errors: errors.array(),
            accountData: { account_id }
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.account_password, 10);
        await accountModel.updatePassword(account_id, hashedPassword);
        req.flash("success", "Password updated!");
        res.redirect("/account/");
    } catch (error) {
        console.error("Error en updatePassword:", error);
        req.flash("error", "Failed to update password.");
        res.redirect(`/account/update/${account_id}`);
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccountManagement,
    accountLogout,
    buildUpdateAccount,
    updateAccount,
    updatePassword
};