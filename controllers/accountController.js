const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
require("dotenv").config()

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
        req.flash("notice", "Error en el servidor. Intenta de nuevo.");
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
        res.status(500).send("Error interno del servidor");
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement }