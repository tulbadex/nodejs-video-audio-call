const flash = (req, res, next) => {
    res.locals.message = req.session.message || null;
    res.locals.status = req.session.status || null;
    delete req.session.message;
    delete req.session.status;
    next();
};

module.exports = flash;