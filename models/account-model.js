const pool = require("../database/index.js")
const bcrypt = require('bcryptjs');

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
) {
    try {
        const hashedPassword = await bcrypt.hash(account_password, 10);

        const result = await pool.query(
            "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *",
            [account_firstname, account_lastname, account_email, hashedPassword]
        );

        return result.rows[0];
    } catch (error) {
        console.error("Error in registerAccount:", error.message);
        throw new Error("Error al registrar");
    }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            "SELECT * FROM account WHERE account_email = $1",
            [account_email]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error en getAccountByEmail:", error);
        return null;
    }
}

module.exports = {
    registerAccount,
    getAccountByEmail
}