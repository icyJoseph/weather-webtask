const express = require("express");
const Webtask = require("webtask-tools");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

const jsonParser = bodyParser.json();

app.use(jsonParser);

const makeGeoURL = (key, encodedAddress) =>
  `http://www.mapquestapi.com/geocoding/v1/address?key=${key}&location=${encodedAddress}`;

const makeWeatherURL = (key, { lat, lng }) =>
  `https://api.darksky.net/forecast/${key}/${lat},${lng}?units=si`;

app.post("/geoweather", (req, res) => {
  const { webtaskContext, body } = req;
  const { address } = body;
  const {
    secrets: { GEOLOCATION_KEY, WEATHER_KEY }
  } = webtaskContext;

  const encodedAddress = encodeURIComponent(address);
  const url = makeGeoURL(GEOLOCATION_KEY, encodedAddress);

  return axios
    .get(url)
    .then(({ data }) => {
      if (
        data.results === undefined ||
        data.results[0].locations.length === 0
      ) {
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
    })
    .then(({ lat, lng, ...rest }) => {
      const url = makeWeatherURL(WEATHER_KEY, { lat, lng });
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
            .send({ currently, hourly, daily, lat, lng, ...rest });
        })
        .catch(() => {
          return res.status(400).send({ reason: "Weather failed" });
        });
    })
    .catch(() => res.status(400).send({ reason: "Location failed" }));
});

app.post("/weather", (req, res) => {
  const { webtaskContext, body } = req;
  const {
    secrets: { WEATHER_KEY }
  } = webtaskContext;

  const { lat, lng } = body;
  const url = makeWeatherURL(WEATHER_KEY, { lat, lng });

  return axios
    .get(url)
    .then(({ data }) => {
      if (data.error) {
        return res
          .status(400)
          .send({ error: "Weather API gave errorenous data" });
      }
      const { currently, hourly, daily } = data;
      return res.status(200).send({ currently, hourly, daily, lat, lng });
    })
    .catch(() => {
      return res.status(400).send({ reason: "Weather failed" });
    });
});

module.exports = Webtask.fromExpress(app);
