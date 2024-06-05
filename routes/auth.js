const router = require('express').Router();
const { login, register, getUsers, saveRecording, getRecentCalls, getRecentCallsApi } = require('../controllers/auth');
const { requireAuth, checkUser, logout, authenticateToken, redirectIfAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../utils/utils')

// Render index page
router.get('/', (req, res) => {
    res.render('index');
});

// Render login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
    req.session.redirectTo = req.originalUrl;
    res.render('auth/login');
});

// Handle login form submission
router.post('/login', login);

// Render registration page
router.get('/register', redirectIfAuthenticated, (req, res) => {
    req.session.redirectTo = req.originalUrl;
    res.render('auth/registeration', {
        firstname: req.session.firstName,
        lastname: req.session.lastName,
        username: req.session.username,
        email: req.session.email
    });

    req.session.firstName = null;
    req.session.lastName = null;
    req.session.username = null;
    req.session.email = null;
});

// Handle registration form submission
router.post('/register', register);

router.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard/index');
});

router.get('/logout', logout);

router.get('/users', requireAuth, getUsers);

router.post('/save-recording', requireAuth, upload.single('recording'), saveRecording);
router.get('/recent-calls', requireAuth, getRecentCallsApi);


module.exports = router;