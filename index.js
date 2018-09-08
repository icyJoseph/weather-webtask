const express = require("express");
const Webtask = require("webtask-tools");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

const jsonParser = bodyParser.json();

app.use(jsonParser);

app.post("/geo", (req, res) => {
  const { webtaskContext, body } = req;
  const { address } = body;
  const {
    secrets: { GEOLOCATION_KEY, WEATHER_KEY }
  } = webtaskContext;
  // forward lat,long to GEO api
  // use response to call weather api
  // process data and return

  const encodedAddress = encodeURIComponent(address);
  const url = `http://www.mapquestapi.com/geocoding/v1/address?key=${GEOLOCATION_KEY}&location=${encodedAddress}`;

  return axios
    .get(url)
    .then(({ data }) => {
      if (
        data.results === undefined ||
        data.results[0].locations.length === 0 ||
        !data.results[0].locations[0].street
      ) {
        return res.status(400).send({ reason: "Your query gave no results" });
      }

      const [
        { street, postalCode, adminArea5, adminArea1, latLng }
      ] = data.results[0].locations;
      console.log(street);
      return {
        street,
        postalCode,
        city: adminArea5,
        country: adminArea1,
        ...latLng
      };
    })
    .then(({ lat, lng, ...rest }) => {
      const url = `https://api.darksky.net/forecast/${WEATHER_KEY}/${lat},${lng}?units=si`;
      return axios
        .get(url)
        .then(({ data }) => {
          if (data.error) {
            return res
              .status(400)
              .reason({ error: "Weather API gave errorenous data" });
          }
          const { currently, hourly, daily } = data;
          return res
            .status(200)
            .send({ currently, hourly, daily, lat, lng, rest });
        })
        .catch(() => {
          return res.status(400).send({ reason: "Weather failed" });
        });
    })
    .catch(() => res.status(400).send({ reason: "Location failed" }));
});

module.exports = Webtask.fromExpress(app);
