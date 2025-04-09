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
        throw new Error("Error in the register");
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

async function getAccountById(account_id) {
    try {
        const result = await pool.query(
            "SELECT * FROM account WHERE account_id = $1",
            [account_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error en getAccountById:", error);
        return null;
    }
}

async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
    try {
        const result = await pool.query(
            `UPDATE account 
         SET account_firstname = $1, 
             account_lastname = $2, 
             account_email = $3 
         WHERE account_id = $4 
         RETURNING *`,
            [account_firstname, account_lastname, account_email, account_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error en updateAccount:", error);
        return null;
    }
}

async function updatePassword(account_id, passwordHash) {
    try {
        const result = await pool.query(
            "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *",
            [passwordHash, account_id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error en updatePassword:", error);
        return null;
    }
}
module.exports = {
    registerAccount,
    getAccountByEmail,
    getAccountById,
    updateAccount,
    updatePassword
}