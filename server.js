const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'Jon',
            email: 'jon@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        },
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
});

app.post('/signin', (req, res) => {
    // bcrypt.compare(password, hash, function(err, res) {
    //     console.log(hash);
    // });

    if(req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password) {
            res.json('success');
    } else {
        res.status(400).json('Error logging in');
    }
});

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    bcrypt.hash(password, 8, function(err, hash) {
        console.log(hash);
    });

    database.users.push({
        id: '125',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    });
    res.json(database.users.slice(-1));
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    // let found = false;
    database.users.forEach(user => {
        if(user.id === id) {
            // found = true;
            return res.json(user);
        }
    });
    res.status(400).json('User not found');
});

app.post('/image', (req, res) => {
    const { id } = req.body;
    database.users.forEach(user => {
        if(user.id === id) {
            user.entries++;
            return res.json(user.entries);
        }
    });
    res.status(400).json('User not found');
});

app.listen(3000, () => {
    console.log('app is running on port 3000');
});

