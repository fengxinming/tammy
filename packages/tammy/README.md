# Tammy

[![npm package](https://nodei.co/npm/tammy.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/tammy)

> Note: The progressive HTTP client for the browser

[![NPM version](https://img.shields.io/npm/v/tammy.svg?style=flat)](https://npmjs.org/package/tammy)
[![NPM Downloads](https://img.shields.io/npm/dm/tammy.svg?style=flat)](https://npmjs.org/package/tammy)
[![](https://data.jsdelivr.com/v1/package/npm/tammy/badge)](https://www.jsdelivr.com/package/npm/tammy)

---

## Table of contents

  - [Installation](#Installation)
  - [Usage](#Usage)
  - [Tammy API](#Tammy-API)
  - [Request Options](#Request-Options)
  - [Options Defaults](#Options-Defaults)
  - [Interceptors](#Interceptors)
  - [Handling Errors](#Handling-Errors)
  - [CancelToken](#CancelToken)
  - [Plugin](#Plugin)
  - [Adapter](#Adapter)
  - [License](#License)

---

## Installation

### Load `tammy` via classical `<script>` tag

```html
<script src="//cdn.jsdelivr.net/npm/tammy/tammy.min.js"></script>
```

### CommonJS style with npm

```bash
npm install tammy --save
npm install tammy-adapter-xhr --save
npm install tammy-plugin-xsrf --save
```

---

## Usage

Performing a `GET` request

```js
import { http } from 'tammy';
import xhr from 'tammy-adapter-xhr';
http.defaults.adapter = xhr;

// Make a request for a user with a given ID
http.get('/user?ID=12345')
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
http.get('/user', {
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
    const response = await http.get('/user?ID=12345');
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
import { http } from 'tammy';

request.post('/user', {
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
import { http } from 'tammy';

request.all([{
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

- Constants
  - CONTENT_TYPE
  - CONTENT_TYPES
  - ECONNABORTED
  - ECONNRESET
  - ENETWORK
  - EREQCANCELLED
- Request
  - cancel
  - cancelAll
  - create
  - http
- Utils
  - createError
  - forOwn
  - formify
  - isAbsoluteURL
  - isCancelled
  - isFunction
  - isNil
  - isNumber
  - isObject
  - isString
  - joinPath
  - joinQuery
  - loop
  - merge
  - noop
  - remove
  - removeAt
  - stringifyQuery
  - uuid

```js
import {
  CONTENT_TYPE,
  CONTENT_TYPES,
  ECONNABORTED,
  ECONNRESET,
  ENETWORK,
  EREQCANCELLED,
  cancel,
  cancelAll,
  create,
  http,
  createError,
  forOwn,
  formify,
  isAbsoluteURL,
  isCancelled,
  isFunction,
  isNil,
  isNumber,
  isObject,
  isString,
  joinPath,
  joinQuery,
  loop,
  merge,
  noop,
  remove,
  removeAt,
  stringifyQuery,
  uuid
} from 'tammy';

```

Requests can be made by passing the relevant options to `http`.

#### http(options)

```js
// Send a POST request

import { http } from 'tammy';

http({
  method: 'post',
  url: '/user/12345',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
});
```

#### http(url[, options])

```js
// Send a GET request (default method)

import { http } from 'tammy';

http('/user/12345');
```

### Request method aliases

For convenience aliases have been provided for all supported request methods.

#### http(options)
#### http.get(url[, data[, options]])
#### http.delete(url[, data[, options]])
#### http.del(url[, data[, options]])
#### http.head(url[, data[, options]])
#### http.options(url[, data[, options]])
#### http.post(url[, data[, options]])
#### http.put(url[, data[, options]])
#### http.patch(url[, data[, options]])

> NOTE: 
When using the alias methods `url`, `method`, and `data` properties don't need to be specified in options.

### Creating an instance

You can create a new instance of tammy with a custom options.

#### create([options])

```js
import { create } from 'tammy';
import xhr from 'tammy-adapter-xhr';

const instance = create({
  baseUrl: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'},
  adapter: xhr
});
```

### Instance methods

The available instance methods are listed below. The specified options will be merged with the instance options.

#### instance(options)
#### instance.get(url[, data[, options]])
#### instance.delete(url[, data[, options]])
#### instance.del(url[, data[, options]])
#### instance.head(url[, data[, options]])
#### instance.options(url[, data[, options]])
#### instance.post(url[, data[, options]])
#### instance.put(url[, data[, options]])
#### instance.patch(url[, data[, options]])

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
- `adapter` - allows custom handling of requests which makes testing easier. Return a promise and supply a valid response (see https://github.com/fengxinming/tammy/blob/master/src/adapters/xhr.js).

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

- `cancelToken` - specifies a cancel token that can be used to abort the request (see CancelToken section below for details)

```javascript
let cancelToken;
// ...

{
  cancelToken: function(token) {
    cancelToken = token;
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

  // `config` is the config that was provided to `tammy` for the request
  config: {},

  // `request` is the request that generated this response
  // It is the last ClientRequest instance in node.js (in redirects)
  // and an XMLHttpRequest instance the browser
  request: {}
}
```

When using `then`, you will receive the response as follows:

```js
import { http } from 'tammy';

http.get('/user/12345')
  .then(function (response) {
    console.log(response.data);
    console.log(response.status);
    console.log(response.statusText);
    console.log(response.headers);
    console.log(response.config);
  });
```

When using `catch`, or passing a [rejection callback](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) as second parameter of `then`, the response will be available through the `error` object as explained in the [Handling Errors](#handling-errors) section.

## Options Defaults

You can specify config defaults that will be applied to every request.

### Global http defaults

```js
import { http } from 'tammy';

http.defaults.baseUrl = 'https://api.example.com';
http.headers.common.Authorization = AUTH_TOKEN;
http.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
});
```

### Custom instance defaults

```js
// Set config defaults when creating the instance
import { create } from 'tammy';

const instance = create({
  baseUrl: 'https://api.example.com'
});

// Alter defaults after instance has been created
instance.headers.common.Authorization = AUTH_TOKEN;
```

### Config order of precedence

Config will be merged with an order of precedence. The order is library defaults found in [lib/Tammy.js](https://github.com/tammy/tammy/blob/master/lib/Tammy.js#L91), then `defaults` property of the instance, and finally `config` argument for the request. The latter will take precedence over the former. Here's an example.

```js
// Create an instance using the config defaults provided by the library
// At this point the timeout config value is `0` as is the default for the library

import { create } from 'tammy';

const instance = create();

// Override timeout default for the library
// Now all requests using this instance will wait 2.5 seconds before timing out
instance.defaults.timeout = 2500;

// Override timeout for this request as it's known to take a long time
instance.get('/longRequest', {
  timeout: 5000
});
```

## Interceptors

You can intercept requests or responses before they are handled by `then` or `catch`.

```js
// Add a request interceptor
import { http } from 'tammy';

const interceptorId = http.interceptors.request.use(function({ interceptors }) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
http.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});
```

If you may need to remove a interceptor later you can.

```js
http.interceptors.request.eject(interceptorId);
http.interceptors.request.eject(1);
```

You can add interceptors to a custom instance of tammy.

```js
import { create } from 'tammy';

const instance = create();
// Add a request interceptor
instance.interceptors.request.use(function({ interceptors }) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.request.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});
```

## Handling Errors

```js
http.get('/user/12345')
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
http.get('/user/12345', {
  validateStatus: function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
  }
})
```

## CancelToken

You can cancel a request using a *CancelToken*.

```js
let cancelToken;

http.get('/user/12345', {
  cancelToken(token) {
    cancelToken = token;
  }
}).catch(function (thrown) {
  if (isCancelled(thrown)) {
    console.log('Request cancelled', thrown.message);
  } else {
    // handle error
  }
});

http.post('/user/12345', {
  name: 'new name'
})

// cancel the request (the message parameter is optional)
http.cancel(cancelToken, 'Operation aborted by the user.');

// cancel all requests
http.cancelAll();
```

> Note: you can abort several requests.

## Plugin

- [xsrf](https://github.com/fengxinming/tammy/tree/master/packages/tammy-plugin-xsrf)

## Adapter

- [xhr](https://github.com/fengxinming/tammy/tree/master/packages/tammy-adapter-xhr)

## License

MIT
