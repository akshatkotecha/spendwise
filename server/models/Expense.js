const mongoose = require('mongoose');

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: CATEGORIES, required: true },
    date: { type: Date, required: true },
    note: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
