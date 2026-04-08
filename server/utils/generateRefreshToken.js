const jwt = require('jsonwebtoken');

function generateRefreshToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: '7d' }
  );
}

module.exports = generateRefreshToken;
