const jwt = require('jsonwebtoken');

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, permissions: user.permissions || [] },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || process.env.ACCESS_TOKEN_TTL || '45m' },
  );

const signRefreshToken = (session) =>
  jwt.sign({ sid: session.id, sub: session.user.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || process.env.REFRESH_TOKEN_TTL || '7d',
  });

module.exports = { signAccessToken, signRefreshToken };

