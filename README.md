# Weather WebTask

Express server using [webtask.io](https://webtask.io/).

## Purpose

This express server is the backend to [my weather UI](https://github.com/icyJoseph/weatherApp).

It's main purpose is to hide secret API keys and reduce the front end asynchronous code to one call.

This express server in turn takes a query, and puts it through the Geolocation API and then the Weather Forecast API.

## Webtask context

The request object contains a bunch of valuable information.

This snippet for a POST request will help you see this information in a more readable way.

```javascript
app.post("/", (req, res) => {
  // To see all the information loaded in the req object
  console.log(Object.keys(req));
  const {
    webtaskContext,
    query,
    body,
    route,
    params,
    originalUrl,
    baseUrl
  } = req;

  console.log("webtaskContext", webtaskContext);
  console.log("query", query);
  console.log("body", body);
  console.log("route", route);
  console.log("params", params);
  console.log("originalUrl", originalUrl);
  console.log("baseUrl", baseUrl);

  return res.status(200).send({});
});
```

The webtaskContext object, gives us access to very useful information, one of which are secrets.

```javascript
{ data: {},
  headers:
   { 'content-type': 'application/json',
     'user-agent': 'vscode-restclient',
     host: 'localhost:1337',
     'accept-encoding': 'gzip, deflate',
     'content-length': '34',
     connection: 'keep-alive',
     'x-wt-params': 'eyJjb250Y1lpZXIiOiJ3ZWJ0YXNrLWxvY2FsIiwibWIiOnRydWUsInBjdHgiOnt9LCJwYiI6bnVsbCwicmVxX2lkIjoiMTUzNjQxNjk4NzU3OCIsImVjdHgiOnt9LCJtZXRhIjp7fSwidG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKallTSTZXMTBzSW1Sa0lqb3hMQ0pxZEdraU9pSlBhSGxPTjFFdlZtOXVXREEzYW1OaWJWTkhkbFJxVFc5bEwwMXpaRUZqV2lJc0ltbGhkQ0k2TVRVpk5qUXhOams0TnpVM09Td2lkR1Z1SWpvaWQyVmlkR0Z6YXkxc2IyTmhiQ0o5LmZrMk9WaXVfR1lNRkduNTlDYUx6WFByUDlBODVCejE4SGdQYTlINnRiS0UiLCJ1cmxfZm9ybWF0IjozfQ==' },
  id: '1536416987892',
  params: {},
  query: {},
  secrets: {},
  meta: {},
  storage:
   { data: undefined,
     etag: undefined,
     get: [Function: get],
     set: [Function: set] },
  token: undefined,
  create_token: [Function],
  create_token_url: [Function],
  read: [Function: readNotAvailable],
  write: [Function: writeNotAvailable] }
```

The secrets are your API keys and other information you may use to forward calls and fetch data from other API endpoints.
