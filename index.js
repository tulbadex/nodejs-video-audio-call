const express = require('express')
const app = express()

const config = require('./config/config');

const PORT = process.env.PORT || 5600;

const sharedSession = require('express-socket.io-session');
const session = require('express-session')
const cookieParser = require("cookie-parser");

const http = require('http');
const socketIo = require('socket.io');

const isProduction = process.env.NODE_ENV === 'dev';

const sessionMiddleware = session({ 
    secret: config.secret, 
    cookie: { 
        httpOnly: true,
        maxAge: 60000, 
        secure: false,
        sameSite: isProduction == 'production' ? 'none' : 'lax'
    }, 
    resave: false, 
    saveUninitialized: true 
});


const server = http.createServer(app);
const io = socketIo(server);

// Initialization
app.use(cookieParser());
app.use(sessionMiddleware);
const path = require('path');
const cors = require('cors');

// adding support for cross-origin
app.use(cors());
app.options('*', cors());

const bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' })); // support json encoded bodies
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 })); 
app.use(express.urlencoded({ extended: true }));

// Set EJS as templating engine 
app.set('view engine', 'ejs');

// serve static content
app.use('/static', express.static(path.join(__dirname, 'public')));

io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));

const { authenticateToken, checkUser } = require('./middleware/authMiddleware');
const setLocals = require('./middleware/setLocals');
const flash = require('./middleware/flash');

// app.use(authenticateToken); // Use middleware globally to set res.locals.user
// app.use(checkUser); // Use middleware globally to set res.locals.user
app.use(setLocals); // Use middleware globally to set res.locals.currentUrl
app.use(flash);

app.get("*", authenticateToken)
app.use('/', require('./routes/auth'));

let users = {};  // Mapping of usernames to socket IDs
let ongoingCalls = {};  // Mapping of usernames to ongoing calls

const { getRecentCalls } = require('./controllers/auth')

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', (username) => {
        users[username] = socket.id;
        updateUsersList();
        getRecentCallList(username);
        console.log('Registered:', username, socket.id);
    });

    socket.on('call-user', (data) => {
        const to = users[data.to];
        if (to) {
            io.to(to).emit('call-made', {
                signal: data.signal,
                from: data.from,
                type: data.type
            });
        } else {
            socket.emit('user-unavailable', { to: data.to });
        }
        updateUsersList();
    });

    socket.on('make-answer', (data) => {
        const to = users[data.to];
        if (to) {
            io.to(to).emit('answer-made', {
                signal: data.signal,
                from: data.from
            });
        }
        updateUsersList();
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);

        let updateUser;
        for (const username in users) {
            if (users[username] === socket.id) {
                updateUser = username;
                console.log('User to update:', updateUser);
                delete users[username];
                break;
            }
        }

        console.log('Updated users list:', users);

        if (updateUser) {
            getRecentCallList(updateUser); // Fetch recent calls on disconnect
        } else {
            console.log('Socket ID not found in users object.');
        }
        updateUsersList();

        console.log('Disconnect from server');
    });

    socket.on('accept-call', (data) => {
        const { to, from } = data;
        io.to(users[to]).emit('call-accepted', { from });
        ongoingCalls[from] = to;
        ongoingCalls[to] = from;
        updateUsersList();
    });

    /* socket.on('reject-call', (data) => {
        const { from, to } = data;
        if (users[to]) {
            io.to(users[to]).emit('call-rejected', { from });
        }
        delete ongoingCalls[from];
        delete ongoingCalls[to];
        updateUsersList();
        getRecentCallList(from);
        console.log('Call rejected from:', from, 'to:', to);
    }); */

    socket.on('end-call', (data) => {
        const { from, to } = data;
        if (users[to]) {
            io.to(users[to]).emit('call-ended', { from });
        }
        delete ongoingCalls[from];
        delete ongoingCalls[to];
        updateUsersList();
        getRecentCallList(from);
        console.log('Call ended from:', from, 'to:', to);
    });

    socket.on('get-users', () => {
        updateUsersList();
    });

    function updateUsersList() {
        const userList = Object.keys(users).map((username) => ({
            username,
            online: true,
            inCall: !!ongoingCalls[username] // Check if the user is in a call
        }));

        io.emit('update-user-list', userList);
    }

    async function getRecentCallList(user) {
        console.log({ user });
        if (!user) return;

        try {
            const calls = await getRecentCalls(user);
            const recentCallList = calls.map((call) => ({
                caller: call.caller,
                receiver: call.receiver,
                duration: call.duration,
                createdAt: call.createdAt
            }));

            io.emit('update-recent-call-list', recentCallList);
        } catch (error) {
            console.error('Error fetching recent calls for socket.io:', error);
        }
    }
});


server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));