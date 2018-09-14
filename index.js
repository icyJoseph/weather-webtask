const express = require("express");
const Webtask = require("webtask-tools");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

const makeGeoURL = (key, encodedAddress) =>
  `http://www.mapquestapi.com/geocoding/v1/address?key=${key}&location=${encodedAddress}`;

const makeReverseGeoURL = (key, { lat, lng }) =>
  `http://www.mapquestapi.com/geocoding/v1/reverse?key=${key}&location=${lat},${lng}`;

const makeWeatherURL = (key, { lat, lng }) =>
  `https://api.darksky.net/forecast/${key}/${lat},${lng}?units=si`;

const getWeather = (url, res, lat, lng, options = {}) => {
  return axios
    .get(url)
    .then(({ data }) => {
      if (data.error) {
        return res
          .status(400)
          .send({ error: "Weather API gave errorenous data" });
      }
      const { currently, hourly, daily } = data;
      return res
        .status(200)
        .send({ currently, hourly, daily, lat, lng, ...options });
    })
    .catch(() => {
      return res.status(400).send({ reason: "Weather failed" });
    });
};

const getGeoLocation = url => {
  return axios.get(url).then(({ data }) => {
    if (data.results === undefined || data.results[0].locations.length === 0) {
      return res.status(400).send({ reason: "Your query gave no results" });
    }

    const [
      { street, postalCode, adminArea5, adminArea1, latLng }
    ] = data.results[0].locations;

    return {
      street,
      postalCode,
      city: adminArea5,
      country: adminArea1,
      ...latLng
    };
  });
};

const jsonParser = bodyParser.json();

app.use(jsonParser);

app.post("/byAddress", (req, res) => {
  const { webtaskContext, body } = req;
  const { address } = body;
  const {
    secrets: { GEOLOCATION_KEY, WEATHER_KEY }
  } = webtaskContext;

  const encodedAddress = encodeURIComponent(address);
  const geoURL = makeGeoURL(GEOLOCATION_KEY, encodedAddress);

  return getGeoLocation(geoURL)
    .then(({ lat, lng, ...rest }) => {
      const weatherURL = makeWeatherURL(WEATHER_KEY, { lat, lng });
      return getWeather(weatherURL, res, lat, lng, rest);
    })
    .catch(() => res.status(400).send({ reason: "Location failed" }));
});

app.post("/byLatLng", (req, res) => {
  const { webtaskContext, body } = req;
  const {
    secrets: { GEOLOCATION_KEY, WEATHER_KEY }
  } = webtaskContext;

  const { lat, lng } = body;
  const geoURL = makeReverseGeoURL(GEOLOCATION_KEY, { lat, lng });

  // Later on move onto parallel requests
  return getGeoLocation(geoURL).then(geolocation => {
    const weatherURL = makeWeatherURL(WEATHER_KEY, { lat, lng });

    return getWeather(weatherURL, res, lat, lng, geolocation);
  });
});

module.exports = Webtask.fromExpress(app);
