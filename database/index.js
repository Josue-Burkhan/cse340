const { Pool } = require("pg");
require("dotenv").config();

let pool;

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text });
      throw error;
    }
  },
};
