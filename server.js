const express = require('express')
const bodyParser = require('body-parser');
const request = require('request');
// const mongoose = require("mongoose");
const axios = require('axios');
const port = process.env.PORT || 3000;

// mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://localhost:27017/node-demo", {useNewUrlParser: true});
// var nameSchema = new mongoose.Schema({
//  city: String
// });

// var User = mongoose.model("User", nameSchema);

const app = express()
const apiKey = 'e0f2fda6af7d89631d00c4b4be39d976';

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  //res.send('Hello World!')
  res.render('index', {weather: null, error: null});
})

app.post('/', function (req, res) {
  var city = req.body.city;
  // let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

  let geocodeUrl = `https://geocoder.api.here.com/6.2/geocode.json?app_id=cxswUfcDo3QqNixB5VF6&app_code=XijfBpiQ6ve3QQYgBfq4Cw&searchtext=${city}`;

  // request(geocodeUrl, function (err, response, body) {
  //   if(err){
  //     res.render('index', {weather: null, error: 'Error, please try again'});
  //   } else {
  //     let weather = JSON.parse(body);
  //     if(!weather.Response.View[0]){
  //       res.render('index', {weather: null, error: 'Unable to find that address.'});
  //     } else {
  //       let weatherText = `It's ${weather.Response.View[0].Result[0].Location.DisplayPosition.Latitude} degrees in ${city}!`;
  //       res.render('index', {weather: weatherText, error: null});


    axios.get(geocodeUrl).then((response) => {
    let weather = response.data.Response.View[0];
    if (!response.data.Response.View[0]) {
      // throw new Error('Unable to find that address.');
      res.render('index', {weather: null, error: 'Unable to find that address.'});
    }
    let latitude = response.data.Response.View[0].Result[0].Location.DisplayPosition.Latitude;
    let longitude = response.data.Response.View[0].Result[0].Location.DisplayPosition.Longitude;
    let weatherUrl = `https://api.darksky.net/forecast/9dd15f1004e5ab0e31c7a4c9a5326c0d/${latitude},${longitude}?units=si`;
    // console.log(response.data);
    return axios.get(weatherUrl);
  }).then((response) => {
    let image = `https://image.maps.api.here.com/mia/1.6/mapview?app_id=cxswUfcDo3QqNixB5VF6&app_code=XijfBpiQ6ve3QQYgBfq4Cw&lat=${response.data.latitude}&lon=${response.data.longitude}`;
    let temperature = response.data.currently.temperature;
    let weatherText = `It's ${temperature} degrees in ${city}!`;
    res.render('index', {weather: weatherText, image: image, error: null});
    // console.log(`It's currently ${temperature} degrees in ${argv.address}.`);
  }).catch((e) => {
    if  (e.code === 'ENOTFOUND') {
      res.render('index', {weather: null, error: 'Unable to connect to API service.'});
      // console.log('Unable to connect to API service.')
    } else {
      res.render('index', {weather: null, error: e.message});
      // console.log(e.message);
    }
  });
});

  // request(url, function (err, response, body) {
  //   if(err){
  //     res.render('index', {weather: null, error: 'Error, please try again'});
  //   } else {
  //     let weather = JSON.parse(body)
  //     if(weather.main == undefined){
  //       res.render('index', {weather: null, error: 'Error, please try again'});
  //     } else {
  //       let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
  //       res.render('index', {weather: weatherText, error: null});
	// 	// var myData = new User(req.body);
	// 	// myData.save()
//       }
//     }
//   });
// })

app.listen(port, () => {
  console.log(`Server is up on port ${port}.`)
});
