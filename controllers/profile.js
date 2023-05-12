// There is no front end for this endpoint. Might consider expanding later.

const handleProfileId = (req, res, pgdb) => {
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
}

module.exports = {
    handleProfileId
}