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

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getSingleInventory
};