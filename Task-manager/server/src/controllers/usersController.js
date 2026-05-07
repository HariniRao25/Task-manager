const User = require('../models/User');

exports.listUsers = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(filter).select('_id name email role createdAt').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
