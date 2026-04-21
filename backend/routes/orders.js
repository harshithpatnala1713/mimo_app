const router = require("express").Router();
const pool   = require("../db/pool");
const auth   = require("../middleware/auth");

// GET /api/orders  — supplier sees all; customer sees own
router.get("/", auth, async (req, res) => {
  try {
    let rows;
    if (req.user.role === "supplier") {
      [rows] = await pool.execute(
        `SELECT o.*, u.name AS customer_name
         FROM orders o
         JOIN users u ON u.id = o.customer_id
         ORDER BY o.created_at DESC`
      );
    } else {
      [rows] = await pool.execute(
        `SELECT o.*, u.name AS customer_name
         FROM orders o
         JOIN users u ON u.id = o.customer_id
         WHERE o.customer_id = ?
         ORDER BY o.created_at DESC`,
        [req.user.id]
      );
    }
    res.json({ orders: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

// POST /api/orders  — customer creates order
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "customer")
    return res.status(403).json({ error: "Only customers can create orders" });

  const { metalType, quantity, width, thickness, notes, contactName, contactInfo } = req.body;
  if (!metalType || !quantity || !contactName)
    return res.status(400).json({ error: "metalType, quantity and contactName are required" });

  try {
    const [result] = await pool.execute(
      `INSERT INTO orders
         (customer_id, customer_name, metal_type, quantity, width, thickness, notes, contact_name, contact_info)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [req.user.id, req.user.name, metalType, quantity,
       width || null, thickness || null, notes || null,
       contactName, contactInfo || null]
    );
    res.status(201).json({ id: result.insertId, message: "Order created" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not create order" });
  }
});

// PUT /api/orders/:id/status  — supplier approves/rejects
router.put("/:id/status", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Only suppliers can update order status" });

  const { status } = req.body;
  if (!["Approved","Rejected","Pending"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  try {
    const [result] = await pool.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Status updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not update status" });
  }
});

module.exports = router;

// DELETE /api/orders/:id  — customer can delete their own pending orders
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "customer")
    return res.status(403).json({ error: "Only customers can delete their orders" });

  try {
    // Only allow deleting own orders that are still Pending
    const [result] = await pool.execute(
      "DELETE FROM orders WHERE id = ? AND customer_id = ? AND status = 'Pending'",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ error: "Order not found, not yours, or already processed" });
    res.json({ message: "Order deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete order" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "customer")
    return res.status(403).json({ error: "Only customers can delete their orders" });
  try {
    const [result] = await pool.execute(
      "DELETE FROM orders WHERE id = ? AND customer_id = ? AND status = 'Pending'",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows)
      return res.status(404).json({ error: "Order not found or already processed" });
    res.json({ message: "Order deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete order" });
  }
});
