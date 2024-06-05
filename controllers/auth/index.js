const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Call = require('../../models/Call');
const config = require('../../config/config');
const { Op } = require('sequelize');

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, config.secret, {
        expiresIn: maxAge
    })
};

exports.register = async (req, res) => {
    const { firstname, lastname, username, email, password } = req.body;
    const formData = { firstname: '', lastname: '', username: '', email: '' };

    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ firstname, lastname, username, email, password: hashedPassword });

        req.session.message = 'User registration successful';
        req.session.status = true;
        req.session.firstName = null;
        req.session.lastName = null;
        req.session.username = null;
        req.session.email = null;
        res.redirect('/login');
    } catch (error) {
        // res.status(500).send('Error registering new user.');
        console.log(error)

        req.session.firstName = firstname;
        req.session.lastName = lastname;
        req.session.username = username;
        req.session.email = email;

        if (error.name === 'SequelizeUniqueConstraintError') {

            let errorMessage;
            if (error.errors.some(err => err.path === 'username')) {
                errorMessage = 'Username is already taken';
            } else if (error.errors.some(err => err.path === 'email')) {
                errorMessage = 'Email is already taken';
            } else {
                errorMessage = error.errors.map(err => err.message).join(', ');
            }
            req.session.message = `Registration failed: ${errorMessage}`;

        } else {
            // Handle other errors
            req.session.message = 'Registration failed, please try again.';
        }
        req.session.status = false;
        
        res.redirect('/register');
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { 
            [Op.or]: [{ username: username }, { email: username }] 
        } });


        if (!user || !bcrypt.compareSync(password, user.password)) {
            req.session.message = 'Invalid credentials';
            req.session.status = false;
            return res.redirect('/login');
        }

        // const token = jwt.sign({ username: user.username }, config.secret, { expiresIn: '1h' });
        const token = createToken(user.id);
        res.cookie('token', token, { httpOnly: true, maxAge: maxAge * 1000});
        req.session.message = 'Login successfully';
        req.session.status = true;
        req.session.user = user;
        req.session.save(() => {
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error(error);
        req.session.message = 'Error logging in, please try again.';
        req.session.status = false;
        res.redirect('/login');
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: {
                username: {
                    [Op.ne]: req.user.username // Exclude current user
                }
            },
            attributes: ['id', 'username']
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users.');
    }
};

exports.saveRecording = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No recording uploaded.' });
        }

        const file = req.file;
        const relativePath = path.relative(path.join(__dirname, '../../recordings'), file.path).replace(/\\/g, '/');
        const originalName = file.filename;

        const { caller, receiver, duration } = req.body;

        try {
            const newCall = await Call.create({
                caller,
                receiver,
                duration,
                recordingPath: relativePath
            });

            res.json(newCall);
        } catch (error) {
            res.status(500).json({ error: 'Error saving call record.', details: error });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.', details: error });
    }
};


exports.getRecentCalls = async (username) => {
    try {
        const calls = await Call.findAll({
            where: {
                [Op.or]: [
                    { caller: username },
                    { receiver: username }
                ]
            },
            order: [['id', 'DESC']],
            limit: 10
        });
        return calls;
    } catch (error) {
        console.error('Error fetching recent calls:', error);
        throw new Error('Error fetching recent calls.');
    }
};


exports.getRecentCallsApi = async (req, res) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).send('Unauthorized');
        }

        const calls = await Call.findAll({
            where: {
                [Op.or]: [
                    { caller: req.user.username },
                    { receiver: req.user.username }
                ]
            },
            order: [['id', 'DESC']],
            limit: 10
        });

        res.json(calls);
    } catch (error) {
        console.error('Error fetching recent calls:', error);
        throw new Error('Error fetching recent calls.');
    }
};