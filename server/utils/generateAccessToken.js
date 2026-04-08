const jwt = require('jsonwebtoken');

function generateAccessToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: '1d' }
  );
}

module.exports = generateAccessToken;
