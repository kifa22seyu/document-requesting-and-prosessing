const jwt = require("jsonwebtoken");

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ 
          success: false,
          message: "Authorization token missing" 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false,
          message: "Insufficient permissions" 
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }
  };
};

module.exports = roleMiddleware;