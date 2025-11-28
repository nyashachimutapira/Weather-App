const Search = require('../models/Search');

exports.listForUser = async (req, res, next) => {
  try {
    const searches = await Search.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ searches });
  } catch (err) {
    next(err);
  }
};

exports.recentPublic = async (req, res, next) => {
  try {
    const searches = await Search.find({}).sort({ createdAt: -1 }).limit(20);
    res.json({ searches });
  } catch (err) {
    next(err);
  }
};
