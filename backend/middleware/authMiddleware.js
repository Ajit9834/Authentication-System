const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJwtSecret } = require("../controllers/authController");

async function protect(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Please log in to access this resource." });
    }
    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded || typeof decoded.sub !== "string") {
      return res.status(401).json({ message: "Invalid or expired authentication token." });
    }
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User account not found." });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

module.exports = protect;
