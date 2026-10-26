const router = require('express').Router();
const mongoose = require('mongoose');
const { body } = require('express-validator');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');
const { requireAuth, validate } = require('../middleware/auth');

router.use(requireAuth);

const currentMonth = () => new Date().toISOString().slice(0, 7);

// Budgets for a month, each with the amount spent so far
router.get('/', async (req, res, next) => {
  try {
    const month = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : currentMonth();
    const [y, m] = month.split('-').map(Number);
    const range = { $gte: new Date(Date.UTC(y, m - 1, 1)), $lt: new Date(Date.UTC(y, m, 1)) };
    const uid = new mongoose.Types.ObjectId(req.userId);
    const [budgets, spent] = await Promise.all([
      Budget.find({ user: req.userId, month }).sort({ category: 1 }).lean(),
      Expense.aggregate([
        { $match: { user: uid, date: range } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
      ]),
    ]);
    const spentMap = Object.fromEntries(spent.map((s) => [s._id, s.total]));
    res.json({
      month,
      budgets: budgets.map((b) => ({ ...b, spent: spentMap[b.category] || 0 })),
      spentByCategory: spentMap,
      totalSpent: spent.reduce((a, s) => a + s.total, 0),
    });
  } catch (e) { next(e); }
});

// Create or update a budget for category + month
router.post(
  '/',
  [
    body('category').isIn(CATEGORIES).withMessage('Choose a valid category'),
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Choose a valid month'),
    body('limit').isFloat({ min: 1, max: 100000000 }).withMessage('Limit must be at least 1').toFloat(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { category, month, limit } = req.body;
      const doc = await Budget.findOneAndUpdate(
        { user: req.userId, category, month },
        { limit },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      res.status(201).json(doc);
    } catch (e) { next(e); }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!doc) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
