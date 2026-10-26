const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = {};
  result.array().forEach((e) => {
    if (!errors[e.path]) errors[e.path] = e.msg;
  });
  res.status(400).json({ message: Object.values(errors)[0], errors });
};
