const setLocals = (req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
};

module.exports = setLocals;
