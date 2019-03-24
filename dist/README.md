# tammy

[![npm package](https://nodei.co/npm/tammy.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy)

> Note: Tiny promise based HTTP client for the browser

---

## Table of contents

  - [Installation](#Installation)
  - [Usage](#Usage)
  - [tammy API](#tammy-API)
  - [Request Options](#Request-Options)
  - [Options Defaults](#Options-Defaults)
  - [Interceptors](#Interceptors)
  - [Handling Errors](#Handling-Errors)
  - [Release History](#Release-History)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="https://cdn.jsdelivr.net/npm/tammy/tammy.min.js"></script>

// or

<script src="https://cdn.jsdelivr.net/npm/tammy/tammy-all.min.js"></script>
```

### CommonJS style with npm

```bash
npm install tammy --save
```

```javascript

// es6
import tammy from 'tammy';
// or
import tammy from 'tammy/es';

// modularity

// use oauth plugin
import oauth from 'tammy/es/oauth';
// use xsrf plugin
import xsrf from 'tammy/es/xsrf';
// use res-headers plugin
import resHeaders from 'tammy/es/res-headers';
tammy
  .use(oauth)
  .use(xsrf)
  .use(resHeaders);

// node
const tammy = require('tammy');

// modularity

// use oauth plugin
const oauth = require('tammy/oauth.common');
// use xsrf plugin
const xsrf = require('tammy/xsrf.common');
// use res-headers plugin
const resHeaders = require('tammy/res-headers.common');

tammy
  .use(oauth)
  .use(xsrf)
  .use(resHeaders);

```

---

## Usage

Performing a `GET` request

```js
const tammy = require('tammy');

// Make a request for a user with a given ID
tammy.get('/user?ID=12345')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });

// Optionally the request above could also be done as
tammy.get('/user', {
    params: {
      ID: 12345
    }
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });  

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getUser() {
  try {
    const response = await tammy.get('/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

> **NOTE:** `async/await` is part of ECMAScript 2017 and is not supported in Internet
> Explorer and older browsers, so use with caution.

Performing a `POST` request

```js
tammy.post('/user', {
    firstName: 'Fred',
    lastName: 'Flintstone'
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
```

Performing multiple concurrent requests

```js
tammy.all([{
  url: '/user/12345',
  params: {
    num: 1
  }
}, '/user/12345/permissions'])
  .then(tammy.spread(function (acct, perms) {
    // Both requests are now complete
  }));

tammy.map({
  url: '/user/12345',
  params: {
    num: 1
  }
}, '/user/12345/permissions')
  .then(tammy.spread(function (acct, perms) {
    // Both requests are now complete
  }));
```

## tammy API

Requests can be made by passing the relevant config to `tammy`.

##### tammy(config)

```js
// Send a POST request
tammy({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

##### tammy(url[, config])

```js
// Send a GET request (default method)
tammy('/user/12345');
```

### Request method aliases

For convenience aliases have been provided for all supported request methods.

##### tammy(config)
##### tammy.get(url[, data[, config]])
##### tammy.delete(url[, data[, config]])
##### tammy.del(url[, data[, config]])
##### tammy.head(url[, data[, config]])
##### tammy.options(url[, data[, config]])
##### tammy.post(url[, data[, config]])
##### tammy.put(url[, data[, config]])
##### tammy.patch(url[, data[, config]])

###### NOTE
When using the alias methods `url`, `method`, and `data` properties don't need to be specified in config.

### Creating an instance

You can create a new instance of tammy with a custom config.

##### tammy.create([config])

```js
const instance = tammy.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});
```

### Instance methods

The available instance methods are listed below. The specified config will be merged with the instance config.

##### tammy(config)
##### tammy.get(url[, data[, config]])
##### tammy.delete(url[, data[, config]])
##### tammy.del(url[, data[, config]])
##### tammy.head(url[, data[, config]])
##### tammy.options(url[, data[, config]])
##### tammy.post(url[, data[, config]])
##### tammy.put(url[, data[, config]])
##### tammy.patch(url[, data[, config]])

## Request Options

These are the available options for making requests. Only the `url` is required. Requests will default to `GET` if `method` is not specified.

```js
{
  // `url` is the server URL that will be used for the request
  url: '/user',

  // `method` is the request method to be used when making the request
  method: 'get', // default

  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of tammy to pass relative URLs
  // to methods of that instance.
  baseURL: 'https://some-domain.com/api/',

  // `headers` are custom headers to be sent
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `params` are the URL parameters to be sent with the request
  // Must be a plain object
  params: {
    ID: 12345
  },

  // `data` is the data to be sent as the request body
  // `data` is compatible with `params` when `params` is null
  data: {
    firstName: 'Fred'
  },

  // `timeout` specifies the number of milliseconds before the request times out.
  // If the request takes longer than `timeout`, the request will be aborted.
  timeout: 1000, // default is `0` (no timeout)

  // `withCredentials` indicates whether or not cross-site Access-Control requests
  // should be made using credentials
  withCredentials: false, // default

  // `adapter` allows custom handling of requests which makes testing easier.
  // Return a promise and supply a valid response (see https://github.com/fengxinming/tammy/blob/master/src/lib/xhr.js).
  adapter: function (config) {
    /* ... */
  },

  // `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
  // This will set an `Authorization` header, overwriting any existing
  // `Authorization` custom headers you have set using `headers`.
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  },

  // `responseType` indicates the type of data that the server will respond with
  // options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  responseType: 'json', // default

  // `xsrfCookieName` is the name of the cookie to use as a value for xsrf token
  xsrfCookieName: 'XSRF-TOKEN', // default

  // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
  xsrfHeaderName: 'X-XSRF-TOKEN', // default

  // `onUploadProgress` allows handling of progress events for uploads
  onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  },

  // `onDownloadProgress` allows handling of progress events for downloads
  onDownloadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  },

  // `maxContentLength` defines the max size of the http response content in bytes allowed
  maxContentLength: 2000,

  // `validateStatus` defines whether to resolve or reject the promise for a given
  // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
  // or `undefined`), the promise will be resolved; otherwise, the promise will be
  // rejected.
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },

  // `Abortion` specifies a abortion token that can be used to abort the request
  // (see Abortion section below for details)
  abortion: new Abortion(),

  // `getAllResponseHeaders` defines the response header that can be parsed
  getAllResponseHeaders: true
}
```

## Response Schema

The response for a request contains the following information.

```js
{
  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  status: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the headers that the server responded with
  // All header names are lower cased
  headers: {},

  // `options` is the config that was provided to `tammy` for the request
  options: {},

  // `request` is the request that generated this response
  // It is the last ClientRequest instance in node.js (in redirects)
  // and an XMLHttpRequest instance the browser
  request: {}
}
```

When using `then`, you will receive the response as follows:

```js
tammy.get('/user/12345')
  .then(function (response) {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.options);
  });
```

When using `catch`, or passing a [rejection callback](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) as second parameter of `then`, the response will be available through the `error` object as explained in the [Handling Errors](#handling-errors) section.

## Options Defaults

You can specify config defaults that will be applied to every request.

### Global tammy defaults

```js
tammy.use(({ defaults, setHeader }) => {
  defaults.baseURL = 'https://api.example.com';
  setHeader('Authorization', AUTH_TOKEN);
  setHeader('Content-Type', 'application/x-www-form-urlencoded', 'POST');
});
```

### Custom instance defaults

```js
// Set config defaults when creating the instance
const instance = tammy.create({
  baseURL: 'https://api.example.com'
});

// Alter defaults after instance has been created
tammy.use(({ setHeader }) => {
  setHeader('Authorization', AUTH_TOKEN);
});
```

### Config order of precedence

Config will be merged with an order of precedence. The order is library defaults found in [lib/defaults.js](https://github.com/tammy/tammy/blob/master/lib/defaults.js#L28), then `defaults` property of the instance, and finally `config` argument for the request. The latter will take precedence over the former. Here's an example.

```js
// Create an instance using the config defaults provided by the library
// At this point the timeout config value is `0` as is the default for the library
const instance = tammy.create();

// Override timeout default for the library
// Now all requests using this instance will wait 2.5 seconds before timing out
tammy.use(({ defaults }) => {
  defaults.timeout = 2500;
});

// Override timeout for this request as it's known to take a long time
instance.get('/longRequest', {
  timeout: 5000
});
```

## Interceptors

You can intercept requests or responses before they are handled by `then` or `catch`.

```js
tammy.use(({ interceptors }) => {
  // Add a request interceptor
  interceptors.request.use(function({ interceptors }) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

  // Add a response interceptor
  interceptors.request.use(function (response) {
    // Do something with response data
    return response;
  }, function (error) {
    // Do something with response error
    return Promise.reject(error);
  });
});
```

If you may need to remove a interceptor later you can.

```js
tammy.use(({ interceptors }) => {
  interceptors.request.eject(1);
});
```

You can add interceptors to a custom instance of tammy.

```js
const instance = tammy.create();
instance.use(({ interceptors }) => {
  // Add a request interceptor
  interceptors.request.use(function({ interceptors }) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

  // Add a response interceptor
  interceptors.request.use(function (response) {
    // Do something with response data
    return response;
  }, function (error) {
    // Do something with response error
    return Promise.reject(error);
  });
});
```

## Handling Errors

```js
tammy.get('/user/12345')
  .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
```

You can define a custom HTTP status code error range using the `validateStatus` config option.

```js
tammy.get('/user/12345', {
  validateStatus: function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
  }
})
```

## Abortion

You can abort a request using a *Abortion*.

```js
const Abortion = tammy.Abortion;
const abortion = new Abortion();

tammy.get('/user/12345', {
  abortion
}).catch(function (thrown) {
  if (tammy.isAborted(thrown)) {
    console.log('Request aborted', thrown.message);
  } else {
    // handle error
  }
});

tammy.post('/user/12345', {
  name: 'new name'
}, {
  abortion
})

// abort the request (the message parameter is optional)
abortion.abort('Operation aborted by the user.');
```

> Note: you can abort several requests.

## Using application/x-www-form-urlencoded format

By default, tammy serializes JavaScript objects to `JSON`. To send data in the `application/x-www-form-urlencoded` format instead, you can use one of the following options.

## License

MIT
