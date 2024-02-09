const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}))
app.use(express.json())

const dontenv = require('dotenv')
dontenv.config({path:'./env/.env'})

app.use('/resource', express.static('public'))
app.use('/resource', express.static(__dirname + '/public'))

app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// conexion DB
const connection = require('./database/db.js')

app.get('/', (req, res) => {
    res.send('Hola Mundo');
})

app.listen(3000, (req, res) => {
    console.log('Server running in http://localhost3000');
})