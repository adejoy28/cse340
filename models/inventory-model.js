const pool = require("../database");

/**
 * Get all classification data
 */

async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}


/**
 * Get all inventory items and classification_name by classification_id
 */
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
        console.error("getclassificationsbyid error " + error);

        throw error;
    }
}

async function getSingleInventory(inv_id) {
    try {
        // Input validation
        if (!inv_id) {
            throw new Error('Invalid inventory ID');
        }

        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.inv_id = $1`,
            [inv_id]
        );

        // Return null if no data found (let controller handle 404)
        return data.rows[0];
    } catch (error) {
        console.error("Error in getSingleInventory:", error.message);
        // Re-throw the error to be handled by the controller
        // throw error;
        return null;
    }
}


/* *******************************
 * Add new classification to database
 * ***************************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
        const result = await pool.query(sql, [classification_name])
        return result
    } catch (error) {
        console.error("Error adding classification:", error)
        throw error
    }
}

/* *******************************
 * Check if classification already exists
 * ***************************** */
async function checkExistingClassification(classification_name) {
    try {
        const sql = "SELECT * FROM public.classification WHERE classification_name = $1"
        const result = await pool.query(sql, [classification_name])
        return result.rowCount > 0
    } catch (error) {
        console.error("Error checking classification:", error)
        return false
    }
}

/* *******************************
 * Add new vehicle to inventory
 * ***************************** */
async function addInventory(invData) {
    try {
        const data = `INSERT INTO public.inventory (
            inv_make, inv_model, inv_year, inv_description, inv_image, 
            inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`

        const values = [
            invData.inv_make,
            invData.inv_model,
            invData.inv_year,
            invData.inv_description,
            invData.inv_image,
            invData.inv_thumbnail,
            invData.inv_price,
            invData.inv_miles,
            invData.inv_color,
            invData.classification_id
        ]

        const result = await pool.query(data, values)
        return result
    } catch (error) {
        console.error("Error adding inventory:", error)
        throw error
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const queryResult = await pool.query(
            "SELECT * FROM public.inventory WHERE inv_id = $1",
            [inv_id]
        );

        console.log(queryResult.rows);
        const sql =
            "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        ])
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
    }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory(inv_id) {
    try {

        const $sql = 'DELETE FROM inventory WHERE inv_id = $1';
 
        const data = await pool.query($sql, [inv_id])
        return data
    } catch (error) {
        console.error("model error: " + error)
    }
}

/* ***************************
 *  Search vehicles with filters
 * ************************** */
async function searchVehicles(filters = {}) {
    try {
        let sql = `SELECT * FROM public.inventory AS i
                  JOIN public.classification AS c
                  ON i.classification_id = c.classification_id WHERE 1=1`;
        let params = [];
        let paramIndex = 1;

        // Price range filter
        if (filters.minPrice) {
            sql += ` AND i.inv_price >= $${paramIndex}`;
            params.push(filters.minPrice);
            paramIndex++;
        }
        if (filters.maxPrice) {
            sql += ` AND i.inv_price <= $${paramIndex}`;
            params.push(filters.maxPrice);
            paramIndex++;
        }

        // Year filter
        if (filters.year) {
            sql += ` AND i.inv_year = $${paramIndex}`;
            params.push(filters.year);
            paramIndex++;
        }

        // Mileage filter
        if (filters.maxMileage) {
            sql += ` AND i.inv_miles <= $${paramIndex}`;
            params.push(filters.maxMileage);
            paramIndex++;
        }

        // Classification filter
        if (filters.classification_id) {
            sql += ` AND i.classification_id = $${paramIndex}`;
            params.push(filters.classification_id);
            paramIndex++;
        }

        sql += ` ORDER BY i.inv_price`;

        const result = await pool.query(sql, params);
        return result.rows;
    } catch (error) {
        console.error("Error searching vehicles:", error);
        throw error;
    }
}


module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getSingleInventory,
    addClassification,
    checkExistingClassification,
    addInventory,
    updateInventory,
    deleteInventory,
    searchVehicles
};