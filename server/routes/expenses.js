const router = require('express').Router();
const { body } = require('express-validator');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');
const { requireAuth, validate } = require('../middleware/auth');

router.use(requireAuth);

const rules = [
  body('title').trim().isLength({ min: 2, max: 80 }).withMessage('Title must be 2-80 characters'),
  body('amount').isFloat({ gt: 0, max: 10000000 }).withMessage('Amount must be greater than 0').toFloat(),
  body('category').isIn(CATEGORIES).withMessage('Choose a valid category'),
  body('date').isISO8601().withMessage('Enter a valid date').custom((v) => {
    if (new Date(v) > new Date(Date.now() + 86400000)) throw new Error('Date cannot be in the future');
    return true;
  }),
  body('note').optional({ values: 'falsy' }).trim().isLength({ max: 200 }).withMessage('Note max 200 characters'),
];

router.get('/', async (req, res, next) => {
  try {
    const { category, month, q } = req.query;
    const filter = { user: req.userId };
    if (category && CATEGORIES.includes(category)) filter.category = category;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      filter.date = { $gte: new Date(Date.UTC(y, m - 1, 1)), $lt: new Date(Date.UTC(y, m, 1)) };
    }
    if (q) filter.title = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    res.json(await Expense.find(filter).sort({ date: -1, createdAt: -1 }));
  } catch (e) { next(e); }
});

router.post('/', rules, validate, async (req, res, next) => {
  try {
    const { title, amount, category, date, note } = req.body;
    res.status(201).json(await Expense.create({ user: req.userId, title, amount, category, date, note }));
  } catch (e) { next(e); }
});

router.put('/:id', rules, validate, async (req, res, next) => {
  try {
    const { title, amount, category, date, note } = req.body;
    const doc = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, amount, category, date, note },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Expense not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!doc) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
