const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    console.log('AUTH: No authorization header');
    return res.status(401).json({
      message: "Authorization header missing",
      success: false
    });
  }

  try {
    const token = req.headers.authorization.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    // Validate admin role for admin routes
    if (req.originalUrl && req.originalUrl.startsWith('/api/admin') && decoded.type !== 'admin') {
      console.log('AUTH: Access denied for non-admin type:', decoded.type, 'on path:', req.originalUrl);
      return res.status(401).json({
        message: "Admin authorization failed",
        success: false
      });
    }

    req.body = req.body || {};
    req.body.userId = decoded.userId;
    console.log('AUTH: userId =', decoded.userId, ', path =', req.originalUrl);
    next();
  } catch (error) {
    console.log('AUTH: JWT verify error:', error.message);
    return res.status(401).json({
      message: "Auth failed",
      success: false
    });
  }
};