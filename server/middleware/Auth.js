const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized: No token provided',
        error: true,
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    
    if (!decoded) {
        return res.status(401).json({
            message: 'Unauthorized: Invalid token',
            error: true,
            success: false,
        });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || 'Unauthorized',
      error: true,
      success: false,
    });
  }
};

module.exports = authMiddleware;
