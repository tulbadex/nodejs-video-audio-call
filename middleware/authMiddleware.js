const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const requireAuth = (req, res, next) => {
    const token = req.cookies.token;
    // check if json web token exists & is verified
    if(token){
        jwt.verify(token, config.secret, (err, decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/login');
            }else{
                console.log(decodedToken);
                next();
            }
        });
    }else{
        res.redirect('/login');
    }
}

// check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, config.secret, async (err, decodedToken) => {
            if(err){
                console.log(err.message);
                req.user = null;
                res.locals.user = null;
                next();
            }else{
                console.log(decodedToken);
                let user = await User.findByPk(decodedToken.id);
                req.user = user;
                res.locals.user = user;
                next();
            }
        });
    } else {
        req.user = null;
        res.locals.user = null;
        next();
    }
}

function authenticateToken(req, res, next) {
    const token = req.cookies.token; // Assuming you're using cookies for token storage
    if (!token) {
        req.user = null;
        res.locals.user = null;
        return next();
    }

    jwt.verify(token, config.secret, async (err, decodedToken) => {
        if (err) {
            req.user = null;
            res.locals.user = null;
            return next();
        }
        try {
            const user = await User.findByPk(decodedToken.id);
            req.user = user;
            res.locals.user = user; // This line sets the user variable for the views
            next();
        } catch (error) {
            console.error('Error fetching user:', error);
            req.user = null;
            res.locals.user = null;
            next();
        }
    });
}

const redirectIfAuthenticated = (req, res, next) => {
    if (req.user) {
        // User is authenticated, redirect to dashboard
        // return res.redirect('/dashboard');

        // User is authenticated, redirect back to the original URL or dashboard
        const redirectTo = req.session.redirectTo || '/dashboard';
        delete req.session.redirectTo; // Remove redirectTo from session
        return res.redirect(redirectTo);
    }
    // User is not authenticated, proceed to next middleware
    next();
};


const logout = (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.cookie('token', '', { maxAge: 1 });
    req.session.destroy(() => {
        res.redirect('/');
    });
};

module.exports = { requireAuth, checkUser, authenticateToken, redirectIfAuthenticated, logout };