const { Pool } = require("pg");
require("dotenv").config();

let pool;

if (process.env.NODE_ENV === "production") {
  // En producción (Render) => usa SSL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // En desarrollo local => sin SSL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

// Versión que soporta logs si quieres
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
