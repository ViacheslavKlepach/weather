const express = require('express')
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const port = process.env.PORT || 3000;

const app = express()
const apiKey = 'e0f2fda6af7d89631d00c4b4be39d976';

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  let city = encodeURIComponent(req.body.city);

  let geocodeUrl = `https://geocoder.api.here.com/6.2/geocode.json?app_id=cxswUfcDo3QqNixB5VF6&app_code=XijfBpiQ6ve3QQYgBfq4Cw&searchtext=${city}`;

    axios.get(geocodeUrl).then((response) => {
    if (!response.data.Response.View[0]) {
      res.render('index', {weather: null, error: 'Unable to find that address.'});
    }
    let latitude = response.data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
    let longitude = response.data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
    let weatherUrl = `https://api.darksky.net/forecast/9dd15f1004e5ab0e31c7a4c9a5326c0d/${latitude},${longitude}?units=si`;
    return axios.get(weatherUrl);
  }).then((response) => {
    let image = `https://image.maps.api.here.com/mia/1.6/mapview?app_id=cxswUfcDo3QqNixB5VF6&app_code=XijfBpiQ6ve3QQYgBfq4Cw&lat=${response.data.latitude}&lon=${response.data.longitude}`;
    let temperature = response.data.currently.temperature;
    let weatherText = `It's ${temperature} degrees in ${decodeURIComponent(city)}!`;
    res.render('index', {weather: weatherText, image: image, error: null});
  }).catch((e) => {
    if  (e.code === 'ENOTFOUND') {
      res.render('index', {weather: null, error: 'Unable to connect to API service.'});
    } else {
      res.render('index', {weather: null, error: e.message});
    }
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}.`)
});
