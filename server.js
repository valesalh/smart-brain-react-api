const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// Establishing DB connection
const pgdb = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'postgrestest',
      database : 'smart-brain'
    }
});

// Setting up express/middleware
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("This endpoint currently serves no purpose.");
});

app.post('/signin', (req, res) => signin.handleSignin(req, res, pgdb, bcrypt));

app.post('/register', (req, res) => register.handleRegister(req, res, pgdb, bcrypt));

// There is no front end for this endpoint. Might consider expanding later.
app.get('/profile/:id', (req, res) => profile.handleProfileId((req, res, pgdb)));

app.put('/image', (req, res) => image.handleImage(req, res, pgdb));

// Console logging for myself.
app.listen(3000, () => {
    console.log('app is running on port 3000');
});