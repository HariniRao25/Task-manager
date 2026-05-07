const permit = (...allowed) => (req, res, next) => {
  const { user } = req;
  if (user && allowed.includes(user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
};

module.exports = { permit };
