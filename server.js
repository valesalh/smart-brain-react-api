const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex')

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

/*
Signin endpoint. Check that given email exists in db. Then, compare (currently synchronous) 
password in req body to hashed password in db.
*/
app.post('/signin', (req, res) => {
    pgdb.select('email', 'hash').from('login')
    .where({ email: req.body.email })
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid) {
            return pgdb.select('*').from('users').where({ email: req.body.email })
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('Unable to get user.'));
        }
        res.status(400).json('Wrong credentials.')
    })
    .catch(err => res.status(400).json('Wrong credentials.'));
});

/*
Register endpoint. Registering must insert values in the users table AND the login table.
Therefore, an atomic db transaction must be used. Note that registering does NOT 
clean strings or verify formatting of inputs.
*/
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const hash = bcrypt.hashSync(password);

    pgdb.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {  
            return trx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
                })
                .then(user => {
                    res.json(user[0]);
                })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('Unable to register.'));
});

/*
There is no front end for this endpoint. Might consider expanding later.
*/
app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    pgdb.select('*').from('users').where({id})
    .then(user => {
        if(user.length) {
            res.json(user[0]);
        }
        else {
            res.status(400).json('User not found.');
        }
    })
    .catch(err => res.status(400).json('An error has occurred.'));
});

/*
Endpoint for submitting an image to the site. Req body must contain user id
so that db can properly update user's score.
*/
app.put('/image', (req, res) => {
    const { id } = req.body;
    pgdb('users').where({id}).increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('Unable to retrieve entries'));
        
});

// Console logging for myself.
app.listen(3000, () => {
    console.log('app is running on port 3000');
});

