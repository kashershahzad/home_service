const jwt = require('jsonwebtoken');

function generateTempToken(userId) {
  return jwt.sign({ id: userId, scope: 'onboarding' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TEMP_EXPIRES_IN || '15m',
  });
}
function generateAuthToken(userId) {
  return jwt.sign({ id: userId, scope: 'full' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

module.exports = { generateTempToken, generateAuthToken };