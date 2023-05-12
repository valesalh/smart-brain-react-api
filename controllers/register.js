/*
Register endpoint. Registering must insert values in the users table AND the login table.
Therefore, an atomic db transaction must be used. Note that registering does NOT 
validate or clean strings or verify formatting of inputs.
*/

const handleRegister = (req, res, pgdb, bcrypt) => {
    const { name, email, password } = req.body;

    if(!email || !name || !password) {
        return res.status(400).json("Incorrect form submission");
    }

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
}

module.exports = {
    handleRegister
};