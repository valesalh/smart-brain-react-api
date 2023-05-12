const makeClarifaiRequest = (imageURL) => {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = '66b6f695050f49948b7075fc7dc27c67';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'valesalh';       
    const APP_ID = 'facerecognitionapp';
    // Change these to whatever model and image URL you want to use
    // const MODEL_ID = 'face-detection';
    // const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    
    const IMAGE_URL = imageURL;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    return requestOptions;
}

const handleAPICall = (req, res) => {
    fetch("https://api.clarifai.com/v2/models/face-detection/outputs", makeClarifaiRequest(req.body.imageURL))
    .then(data => data.json())
    .then(data => res.json(data))
    .catch(err => res.status(400).json("Unable to work with API"));
}

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
    handleImage,
    handleAPICall
}