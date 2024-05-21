const express = require('express')
const app = express()

const PORT = process.env.PORT || 5000;

const session = require('express-session')
const cookieParser = require("cookie-parser");

// Initialization
app.use(cookieParser());
app.use(session({ secret: 'secretkey', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }));
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
app.use('/', require('./routes/upload'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});