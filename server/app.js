const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// Serve static files from client directory
app.use('/client', express.static(path.join(__dirname,'../client')));
// Set up routing
const router = require('./router');
router(app);
// Set up services
const services = require('./services');
services(app);
// Start server
app.listen(5000, ()=>console.log('Listening on port 5000'));
