const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  city: { type: String, required: true },
  response: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Search', SearchSchema);
