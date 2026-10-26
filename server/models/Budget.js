const mongoose = require('mongoose');
const { CATEGORIES } = require('./Expense');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // YYYY-MM
    limit: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
