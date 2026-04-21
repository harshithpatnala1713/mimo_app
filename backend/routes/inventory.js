const router = require("express").Router();
const pool   = require("../db/pool");
const auth   = require("../middleware/auth");

// ── Metal Types ───────────────────────────────────────────────

// GET /api/inventory/metal-types
router.get("/metal-types", auth, async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM metal_types ORDER BY name ASC"
    );
    res.json({ metalTypes: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch metal types" });
  }
});

// POST /api/inventory/metal-types
router.post("/metal-types", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  const { code, name, grade, category, density, unit, status } = req.body;
  if (!code || !name || !category)
    return res.status(400).json({ error: "code, name and category are required" });

  try {
    const [result] = await pool.execute(
      "INSERT INTO metal_types (code, name, grade, category, density, unit, status) VALUES (?,?,?,?,?,?,?)",
      [code, name, grade || null, category, density || null, unit || "kg/m³", status || "Active"]
    );
    res.status(201).json({ id: result.insertId, message: "Metal type created" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Code already exists" });
    console.error(e);
    res.status(500).json({ error: "Could not create metal type" });
  }
});

// PUT /api/inventory/metal-types/:id
router.put("/metal-types/:id", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  const { code, name, grade, category, density, unit, status } = req.body;
  try {
    const [result] = await pool.execute(
      "UPDATE metal_types SET code=?, name=?, grade=?, category=?, density=?, unit=?, status=? WHERE id=?",
      [code, name, grade || null, category, density || null, unit || "kg/m³", status || "Active", req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not update metal type" });
  }
});

// DELETE /api/inventory/metal-types/:id
router.delete("/metal-types/:id", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  try {
    const [result] = await pool.execute(
      "DELETE FROM metal_types WHERE id=?", [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete metal type" });
  }
});

// ── Coil Stock ────────────────────────────────────────────────

// GET /api/inventory/coils
router.get("/coils", auth, async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, m.name AS metal_type_name, m.code AS metal_type_code
       FROM coil_stock c
       LEFT JOIN metal_types m ON m.id = c.metal_type_id
       ORDER BY c.created_at DESC`
    );
    res.json({ coils: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch coils" });
  }
});

// POST /api/inventory/coils
router.post("/coils", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  const { coilId, metalTypeId, supplierName, heatNo, width, thickness,
          grossWeight, currentWeight, location, status, receivedDate } = req.body;

  if (!coilId || !metalTypeId)
    return res.status(400).json({ error: "coilId and metalTypeId are required" });

  try {
    const [result] = await pool.execute(
      `INSERT INTO coil_stock
         (coil_id, metal_type_id, supplier_name, heat_no, width, thickness,
          gross_weight, current_weight, location, status, received_date)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [coilId, metalTypeId, supplierName || null, heatNo || null,
       width || null, thickness || null, grossWeight || null,
       currentWeight || null, location || null,
       status || "Available", receivedDate || null]
    );
    res.status(201).json({ id: result.insertId, message: "Coil created" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Coil ID already exists" });
    console.error(e);
    res.status(500).json({ error: "Could not create coil" });
  }
});

// PUT /api/inventory/coils/:id
router.put("/coils/:id", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  const { coilId, metalTypeId, supplierName, heatNo, width, thickness,
          grossWeight, currentWeight, location, status, receivedDate } = req.body;

  try {
    const [result] = await pool.execute(
      `UPDATE coil_stock SET
         coil_id=?, metal_type_id=?, supplier_name=?, heat_no=?,
         width=?, thickness=?, gross_weight=?, current_weight=?,
         location=?, status=?, received_date=?
       WHERE id=?`,
      [coilId, metalTypeId, supplierName || null, heatNo || null,
       width || null, thickness || null, grossWeight || null,
       currentWeight || null, location || null,
       status || "Available", receivedDate || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not update coil" });
  }
});

// DELETE /api/inventory/coils/:id
router.delete("/coils/:id", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  try {
    const [result] = await pool.execute(
      "DELETE FROM coil_stock WHERE id=?", [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not delete coil" });
  }
});

module.exports = router;
