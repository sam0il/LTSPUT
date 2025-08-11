// set up server
const express = require('express')
const app = express();
const PORT = 5022;
const fs = require('fs');
const https = require('https');

const cors = require('cors')
const path = require('path')
const bodyParser = require('body-parser')
const querystring = require('querystring')
const url = require('url')
require('dotenv').config()
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({ extended : false}))
app.use(bodyParser.json())

// connect to database
const DB = require('./config/db.js')



app.use(express.urlencoded({extended : true}))
// cors
app.use(cors({
  origin: ['http://88.200.63.148:3022', 'https://student.famnit.upr.si'],  
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
  credentials: true
}));



// - session variable
const session = require('express-session')

app.set('trust proxy', 1)

// Update session configuration
app.use(session({
  secret: 'some-secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Mount routes
const user = require('./routes/user.js');
app.use('/user', user);

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const technicianRoutes = require('./routes/technician');
app.use('/technician', technicianRoutes);



const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

// Start server
//app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
https.createServer(options, app).listen(PORT, () => console.log(`https server listening on port ${PORT}`));