const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/client', express.static(path.join(__dirname,'../client')));

const router = require('./router');
router(app);

const services = require('./services');
services(app);

app.listen(5000, ()=>console.log('Listening on port 5000'));
