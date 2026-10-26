const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { validate, requireAuth } = require('../middleware/auth');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').trim().isEmail().withMessage('Enter a valid email'),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain a number'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email: email.toLowerCase() })) {
        return res.status(409).json({ message: 'Email already registered', errors: { email: 'Email already registered' } });
      }
      const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
      res.status(201).json({ token: sign(user), user: publicUser(user) });
    } catch (e) { next(e); }
  }
);

router.post(
  '/login',
  [body('email').trim().isEmail().withMessage('Enter a valid email'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.json({ token: sign(user), user: publicUser(user) });
    } catch (e) { next(e); }
  }
);

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

module.exports = router;
