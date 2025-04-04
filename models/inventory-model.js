const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getInventoryById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [inv_id]);
    console.log("Query result:", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return [];
  }
}

async function addClassification(classification_name) {
  try {
    const result = await pool.query("INSERT INTO public.classification (classification_name) VALUES ($1)", [classification_name]);
    return result;
  } catch (error) {
    console.error("Error adding classification: ", error);
    throw error;
  }
}


async function deleteClassification(classification_id) {
  try {
    const sql = "DELETE FROM classification WHERE classification_id = $1 RETURNING *";
    const result = await pool.query(sql, [classification_id]);
    return result.rowCount;
  } catch (error) {
    throw new Error("Error deleting classification: " + error.message);
  }
}

/* ***************************
 * Get all classifications
 * ************************** */
async function getAllClassifications() {
  try {
    const result = await pool.query("SELECT * FROM classification ORDER BY classification_name ASC");
    return result.rows;
  } catch (error) {
    console.error("Error fetching classifications:", error);
    throw error;
  }
}

/* ***************************
 * Add new vehicle to inventory
 * ************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const query = `
      INSERT INTO inventory (
        inv_make,        
        inv_model,       
        inv_year,        
        inv_description, 
        inv_image,       
        inv_thumbnail,   
        inv_price,       
        inv_miles,       
        inv_color,       
        classification_id 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING inv_id`;

    const result = await pool.query(query, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Error in PostgreSQL:", error.message);
    throw error;
  }
}


/* ***************************
 * Build classification list for form
 * ************************** */
async function buildClassificationList(classification_id = null) {
  try {
    let data = await getAllClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";

    data.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected ";
      }
      classificationList += `>${row.classification_name}</option>`;
    });

    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error);
    throw error;
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  deleteClassification,
  getAllClassifications,
  addInventory,
  buildClassificationList
}
