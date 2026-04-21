const router = require("express").Router();
const pool   = require("../db/pool");
const auth   = require("../middleware/auth");

const DEFAULT_SHEET_WIDTH = 1500;

router.post("/", auth, async (req, res) => {
  if (req.user.role !== "supplier")
    return res.status(403).json({ error: "Suppliers only" });

  const { orderIds } = req.body;
  if (!Array.isArray(orderIds) || orderIds.length === 0)
    return res.status(400).json({ error: "orderIds array required" });

  try {
    const placeholders = orderIds.map(() => "?").join(",");
    const [orders] = await pool.execute(
      `SELECT id, metal_type, quantity, width, thickness, customer_name, status FROM orders WHERE id IN (${placeholders})`,
      orderIds
    );

    if (!orders.length)
      return res.status(404).json({ error: "No matching orders found" });

    const totalWidth = orders.reduce((s, o) => s + (Number(o.width) || 0), 0);
    let sourceCoil = null, sheetWidth = DEFAULT_SHEET_WIDTH, source = "new_sheet";

    try {
      const [coils] = await pool.execute(
        "SELECT * FROM coil_stock WHERE status = 'Available' AND width >= ? ORDER BY width ASC LIMIT 1",
        [totalWidth > 0 ? totalWidth : DEFAULT_SHEET_WIDTH]
      );
      if (coils.length) { sourceCoil = coils[0]; sheetWidth = Number(sourceCoil.width); source = "inventory"; }
    } catch (_) {}

    let position = 0;
    const cuts = [], warnings = [];

    for (const order of orders) {
      const cutWidth = Number(order.width) || 0;
      if (!cutWidth) { warnings.push(`Order #${order.id} has no width - skipped`); continue; }
      if (position + cutWidth > sheetWidth) { warnings.push(`Order #${order.id} does not fit`); continue; }
      cuts.push({ orderId: order.id, customerName: order.customer_name || "-", metalType: order.metal_type || "-", cutWidth, quantity: order.quantity, position });
      position += cutWidth;
    }

    const remaining   = sheetWidth - position;
    const utilization = sheetWidth > 0 ? Math.round((position / sheetWidth) * 100) : 0;

    let planId = Date.now();
    try {
      const [r] = await pool.execute(
        "INSERT INTO cut_plans (sheet_width, remaining, utilization, source, coil_id) VALUES (?,?,?,?,?)",
        [sheetWidth, remaining, utilization, source, sourceCoil?.id || null]
      );
      planId = r.insertId;
      for (const cut of cuts) {
        await pool.execute(
          "INSERT INTO cut_plan_items (plan_id, order_id, cut_width, position) VALUES (?,?,?,?)",
          [planId, cut.orderId, cut.cutWidth, cut.position]
        );
      }
    } catch (_) {}

    res.json({ plan: { planId, sheetWidth, remaining, utilization, source, coilId: sourceCoil?.id || null, cuts, warnings } });

  } catch (e) {
    console.error("[optimize]", e.message);
    res.status(500).json({ error: e.message || "Optimization failed" });
  }
});

router.get("/", auth, async (_req, res) => {
  try {
    const [plans] = await pool.execute("SELECT * FROM cut_plans ORDER BY created_at DESC LIMIT 50");
    res.json({ plans });
  } catch (_) { res.json({ plans: [] }); }
});

module.exports = router;
