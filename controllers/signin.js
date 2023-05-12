/*
Signin endpoint. Check that given email exists in db. Then, compare (currently synchronous) 
password in req body to hashed password in db.
*/

const handleSignin = (req, res, pgdb, bcrypt) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json("Incorrect form submission");
    }

    pgdb.select('email', 'hash').from('login')
    .where({ email: email })
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if(isValid) {
            return pgdb.select('*').from('users').where({ email: email })
            .then(user => {
                res.json(user[0]);
            })
            .catch(err => res.status(400).json('Unable to get user.'));
        }
        res.status(400).json('Wrong credentials.')
    })
    .catch(err => res.status(400).json('Wrong credentials.'));
}

module.exports = {
    handleSignin
}