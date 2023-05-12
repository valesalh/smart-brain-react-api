/*
Endpoint for submitting an image to the site. Req body must contain user id
so that db can properly update user's score.
*/

const handleImage = (req, res, pgdb) => {
    const { id } = req.body;
    pgdb('users').where({id}).increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('Unable to retrieve entries'));   
}

module.exports = {
    handleImage
}