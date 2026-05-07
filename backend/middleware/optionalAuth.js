const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token, proceed as guest
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
  } catch (err) {
    // Ignore invalid tokens for optional auth, proceed as guest
    console.error('Optional Auth - JWT Verification Error:', err.message);
  }
  next();
};
