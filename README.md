# Tammy

[![npm package](https://nodei.co/npm/tammy.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy)

> Note: The progressive HTTP client for the browser and node.js

[![NPM version](https://img.shields.io/npm/v/tammy.svg?style=flat)](https://npmjs.org/package/tammy) [![NPM Downloads](https://img.shields.io/npm/dm/tammy.svg?style=flat)](https://npmjs.org/package/tammy)

---

## Table of contents

  - [Installation](#Installation)
  - [Usage](#Usage)
  - [Tammy API](#Tammy-API)
  - [Request Options](#Request-Options)
  - [Options Defaults](#Options-Defaults)
  - [Interceptors](#Interceptors)
  - [Handling Errors](#Handling-Errors)
  - [Abortion](#Abortion)
  - [Plugin](#Plugin)
  - [License](#License)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="//cdn.jsdelivr.net/npm/tammy/tammy.min.js"></script>

// or

<script src="//cdn.jsdelivr.net/npm/tammy/tammy.browser.min.js"></script>
```

### CommonJS style with npm

```bash
npm install tammy --save
```

#### Request for for Browsers

```javascript

// es6
import tammy from 'tammy';
// or
import tammy from 'tammy/index';

// optional modularity

// use auth plugin
import auth from 'tammy/plugins/auth';
// use xsrf plugin
import xsrf from 'tammy/plugins/xsrf';
// use res-headers plugin
import resHeaders from 'tammy/plugins/res-headers';
tammy
  .use(auth)
  .use(xsrf)
  .use(resHeaders);

// es5
const tammy = require('tammy');

// optional modularity

// use auth plugin
const auth = require('tammy/auth');
// use xsrf plugin
const xsrf = require('tammy/xsrf');
// use res-headers plugin
const resHeaders = require('tammy/res-headers');
tammy
  .use(auth)
  .use(xsrf)
  .use(resHeaders);  

```

#### Request for for Node

```javascript

// node
const tammy = require('tammy');

tammy.use(require('tammy/http'));

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
  qs: {
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
  qs: {
    num: 1
  }
}, '/user/12345/permissions'])
  .then(function (arr) {
    // Both requests are now complete
  });
```

---

## Tammy API

Requests can be made by passing the relevant options to `tammy`.

##### tammy(options)

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

##### tammy(url[, options])

```js
// Send a GET request (default method)
tammy('/user/12345');
```

### Request method aliases

For convenience aliases have been provided for all supported request methods.

##### tammy(options)
##### tammy.get(url[, data[, options]])
##### tammy.delete(url[, data[, options]])
##### tammy.del(url[, data[, options]])
##### tammy.head(url[, data[, options]])
##### tammy.options(url[, data[, options]])
##### tammy.post(url[, data[, options]])
##### tammy.put(url[, data[, options]])
##### tammy.patch(url[, data[, options]])

###### NOTE
When using the alias methods `url`, `method`, and `data` properties don't need to be specified in options.

### Creating an instance

You can create a new instance of tammy with a custom options.

##### tammy.create([options])

```js
const instance = tammy.create({
  baseUrl: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});
```

### Instance methods

The available instance methods are listed below. The specified options will be merged with the instance options.

##### instance(options)
##### instance.get(url[, data[, options]])
##### instance.delete(url[, data[, options]])
##### instance.del(url[, data[, options]])
##### instance.head(url[, data[, options]])
##### instance.options(url[, data[, options]])
##### instance.post(url[, data[, options]])
##### instance.put(url[, data[, options]])
##### instance.patch(url[, data[, options]])

---

## Request Options

These are the available options for making requests. Only the `url` is required. Requests will default to `GET` if `method` is not specified.

- `url` - the server url will be used for the request.
- `baseUrl` - fully qualified uri string used as the base url, for example when you want to do many requests to the same domain. If `baseUrl` is `https://example.com/api/`, then requesting `/end/point?test=true` will fetch `https://example.com/api/end/point?test=true`. When `baseUrl` is given, `uri` must also be a string.
- `method` - the request method can be used when making the request (default: `"GET"`).
- `headers` - custom headers can be sent (default: `{'Accept': 'application/json, text/plain, */*'}`).

```javascript
{
  headers: {'X-Requested-With': 'XMLHttpRequest'}
}
```

- `qs` - the url parameters can be sent with the request that is a plain object or query string.
- `data` - the data can be sent as the request body(object、json string or form string), and it is also compatible with `qs` when `qs` is null.
- `cache` - set `false` that `url` will be appended timestamp if `method` is `HEAD` `DELETE` or `GET`
- `timeout` - integer containing number of milliseconds, controls two timeouts (default: `0` no timeout).
  - **Read timeout**: Time to wait for a server to send response headers (and start the response body) before aborting the request.
  - **Connection timeout**: Sets the socket to timeout after `timeout` milliseconds of inactivity. Note that increasing the timeout beyond the OS-wide TCP connection timeout will not have any effect ([the default in Linux can be anywhere from 20-120 seconds][linux-timeout])

[linux-timeout]: http://www.sekuda.com/overriding_the_default_linux_kernel_20_second_tcp_socket_connect_timeout
- `adapter` - allows custom handling of requests which makes testing easier. Return a promise and supply a valid response (see https://github.com/fengxinming/tammy/blob/master/src/lib/xhr.js).

```javascript
{
  adapter: function (options) {
    /* ... */
  }
}
```

- `validateStatus` - defines whether to resolve or reject the promise for a given HTTP response status code. If `validateStatus` returns `true` (or is set to `null` or `undefined`), the promise will be resolved; otherwise, the promise will be rejected (default: `(status >= 200 && status < 300) || status === 304`.

```javascript
{
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 304; // default
  }
}
```

- `abortion` - specifies a abortion token that can be used to abort the request (see Abortion section below for details)

```javascript
let abortionToken;
// ...

{
  abortion: function(token) {
    abortionToken = token;
  }
}
```

- `responseType` - indicates the type of data that the server will respond with options are 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream' (default: `"json"`).

---

- `withCredentials` - indicates whether or not cross-site Access-Control requests (default: `false`).
- `auth` - indicates that HTTP Basic auth should be used, and supplies credentials. This will set an `Authorization` header, overwriting any existing `Authorization` custom headers you have set using `headers`. before setting `auth` you must preload `auth plugin` (see Installation section below for details)

```javascript
{
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  }
}
```

- `xsrfCookieName` the name of the cookie use as a value for xsrf token (default: `"XSRF-TOKEN"`).
- `xsrfHeaderName` the name of the http header that carries the xsrf token value (default: `"X-XSRF-TOKEN"`).
- `onUploadProgress` - allows handling of progress events for uploads.

```javascript
{
  onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  }
}
```  

- `onDownloadProgress` - allows handling of progress events for downloads.

```javascript
{
  onDownloadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  }
}
```

- `getAllResponseHeaders` defines the response header that can be parsed if it is `true`. before setting `getAllResponseHeaders ` you must preload `res-headers  plugin` (see Installation section below for details)

---

## Response Schema

The response for a request contains the following information.

```javascript
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
  defaults.baseUrl = 'https://api.example.com';
  setHeader('Authorization', AUTH_TOKEN);
  setHeader('Content-Type', 'application/x-www-form-urlencoded', 'POST');
});
```

### Custom instance defaults

```js
// Set config defaults when creating the instance
const instance = tammy.create({
  baseUrl: 'https://api.example.com'
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
let abortionToken;

tammy.get('/user/12345', {
  abortion(token) {
    abortionToken = token;
  }
}).catch(function (thrown) {
  if (tammy.isAborted(thrown)) {
    console.log('Request aborted', thrown.message);
  } else {
    // handle error
  }
});

tammy.post('/user/12345', {
  name: 'new name'
})

// abort the request (the message parameter is optional)
tammy.abort(abortionToken, 'Operation aborted by the user.');

// abort all requests
tammy.abortAll();
```

> Note: you can abort several requests.

## Plugin

- [auth](https://github.com/fengxinming/tammy/tree/master/src/plugins/auth)
- [http](https://github.com/fengxinming/tammy/tree/master/src/plugins/http)
- [res-headers](https://github.com/fengxinming/tammy/tree/master/src/plugins/res-headers)
- [xsrf](https://github.com/fengxinming/tammy/tree/master/src/plugins/xsrf)

## License

MIT
