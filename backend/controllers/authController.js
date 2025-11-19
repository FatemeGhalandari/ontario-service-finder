const jwt = require("jsonwebtoken");

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminEmail || !adminPassword || !jwtSecret) {
    console.error("ADMIN_EMAIL, ADMIN_PASSWORD, or JWT_SECRET not configured");
    return res.status(500).json({ error: "Auth not configured on server" });
  }

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      sub: adminEmail,
      role: "admin",
    },
    jwtSecret,
    { expiresIn: "2h" }
  );

  res.json({ token });
}

module.exports = { login };
