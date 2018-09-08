# Weather WebTask

Express server using [webtask.io](https://webtask.io/).

## Purpose

This express server is the backend to [my weather UI](https://github.com/icyJoseph/weatherApp).

It's main purpose is to hide secret API keys and reduce the front end asynchronous code to one call.

This express server in turn takes a query, and puts it through the Geolocation API and then the Weather Forecast API.
