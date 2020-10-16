let mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    port = 3000,
    express = require('express'),
    request = require('request'),
    app = express();

let apiKey =

    mongoose.connect('mongodb://localhost/faredata', { useNewUrlParser: true, useUnifiedTopology: true });

let fareSchema = mongoose.Schema({
    pool: {
        fareKilometer: Number,
        fareMinute: Number
    },
    premier: {
        fareKilometer: Number,
        fareMinute: Number
    },
    xl: {
        fareKilometer: Number,
        fareMinute: Number
    },
});

const Fare = mongoose.model('fare', fareSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//single route in which i need 4 key-value pairs namely startLatitude/startLongitude/endLatitude/endLongitude
app.get('/', (req, res) => {
    let startLatitude = req.body.startLatitude,
        startLongitude = req.body.startLongitude,
        endLatitude = req.body.endLatitude,
        endLongitude = req.body.endLongitude;

    const dict = {

    }

    let url = (`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${startLatitude},${startLongitude}&destinations=${endLatitude},${endLongitude}&key=${apiKey}`)

    request(url, (err, response, body) => {
        if (!err && response.statusCode == 200) {

            var parsedBody = JSON.parse(body)
            let distance = (parsedBody.rows[0].elements[0].distance.value) / 1000,
                duration = parsedBody.rows[0].elements[0].duration.value / 60;
            console.log('distance in km ', distance)
            console.log('duration in minutes ', duration)
                //pool
            let pool = {};
            pool.fareKilometer = distance * 1;
            pool.fareMinute = duration * 1;

            //premier
            let premier = {};
            premier.fareKilometer = distance * 1.5;
            premier.fareMinute = duration * 1;

            //XL
            let xl = {};
            xl.fareKilometer = distance * 2;
            xl.fareMinute = duration * 1.3;

            let newObject = { pool, premier, xl };
            new Fare(newObject).save()
                .then(data => {
                    console.log(data);
                    res.json({
                        'success': true,
                        'data': data
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.json({
                        'error': err
                    })
                });
        }
    })
});

app.listen(port, () => {
    console.log(`listening at `, port)
})