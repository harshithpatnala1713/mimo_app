const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../db/pool");
const auth    = require("../middleware/auth");

const SECRET  = process.env.JWT_SECRET    || "dev_secret";
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    SECRET,
    { expiresIn: EXPIRES }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role = "customer" } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "name, email and password are required" });
  if (!["supplier","customer"].includes(role))
    return res.status(400).json({ error: "role must be supplier or customer" });

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
      [name, email, hash, role]
    );
    const user = { id: result.insertId, name, email, role };
    res.status(201).json({ token: makeToken(user), user });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Email already registered" });
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password are required" });

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1", [email]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const u = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ token: makeToken(u), user: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ user: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not fetch user" });
  }
});

module.exports = router;
